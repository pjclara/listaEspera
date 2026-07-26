<?php

namespace App\Services;

use Carbon\Carbon;
use DateTimeInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Spatie\SimpleExcel\SimpleExcelReader;

class ExcelImportService
{
    private const SERVICE_GROUP = 'HSA - Cirurgia';
    private const DEFAULT_BATCH_SIZE = 1000;

    private array $headerMap = [
        'Nº LISTA' => 'id',
        'NUM_LISTA' => 'id',
        'LISTA' => 'id',
        'NUM_LISTA_ESPERA' => 'id',
        'DTA_INSCR' => 'data_marcacao',
        'DTA_TMRG' => 'data_marcacao',
        'DATA_INSCRICAO' => 'data_marcacao',
        'DTA_MARCACAO' => 'data_marcacao',
        'DTA_AGEN' => 'data_agenda',
        'DATA_AGENDA' => 'data_agenda',
        'PRIORIDADE' => 'prioridade',
        'PR' => 'prioridade',
        'Regime' => 'regime',
        'Regim' => 'regime',
        'Situacao' => 'situacao',
        'SITUACAO' => 'situacao',
        'DES_DIAGNOSTICO' => 'des_diagnostico',
        'DES_DIAGNOSTIC' => 'des_diagnostico',
        'NOME_CLINICO' => 'nome_clinico',
        'NOME_CLIN' => 'nome_clinico',
        'OBSERVACOES' => 'observacoes_gerais',
        'OBSER' => 'observacoes_gerais',
        'ESTADO' => 'estado',
        'DTA_OPERADO' => 'data_operado',
        'NUM_PROCESSO' => 'num_processo',
        'SEXO' => 'sexo',
        'DES_GRUPO' => 'des_grupo',
        'DTA_CANCEL' => 'data_cancel',
        'CANCEL' => 'cancel',
        'DES_CANCEL' => 'des_cancel',
        'PATOLOGIA'          => 'patologia',
        'COD_MEDICO'         => 'cod_medico',
        'INTERV_CIRURGICA'   => 'interv_cirurgica',
        'UTENTE'       => 'num_processo',
        'NOME' => 'nome'
    ];

    private array $dateFields = [
        'data_marcacao',
        'data_agenda',
        'data_operado',
        'data_cancel',
    ];

    public function import($file, string $type = 'xlsx', int $batchSize = self::DEFAULT_BATCH_SIZE)
    {

        $rows = SimpleExcelReader::create($file, $type)->getRows();

        $buffer = [];
        $stats = [
            'importados' => 0,
            'atualizados' => 0,
            'inalterados' => 0,
        ];

        foreach ($rows as $row) {

            $normalizedRow = $this->normalizeRow($row);

            if ($normalizedRow === null) {
                continue;
            }



            $buffer[$normalizedRow['id']] = $normalizedRow;


            if (count($buffer) >= $batchSize) {
                $stats = $this->mergeStats($stats, $this->processBatch($buffer));
                $buffer = [];
            }
        }

        if (!empty($buffer)) {
            $stats = $this->mergeStats($stats, $this->processBatch($buffer));
        }

        if ($this->shouldRecalculatePositions()) {
            $this->updatePositions();
            $this->updatePositionsByPatologia();
        }

        return $stats;
    }

    private function normalizeRow(array $row): ?array
    {
        $normalizedRow = [];

        foreach ($row as $colName => $value) {
            $key = trim((string) $colName);

            if (array_key_exists($key, $this->headerMap)) {
                $normalizedRow[$this->headerMap[$key]] = $value;
            }
        }

        if (isset($normalizedRow['des_grupo'])) {
            $desGrupo = $this->normalizeString($normalizedRow['des_grupo'] ?? null);
            if (strtolower($desGrupo) !== strtolower(self::SERVICE_GROUP)) {
                return null;
            }
        }
        $id = (int) ($normalizedRow['id'] ?? 0);
        if ($id <= 0) {
            return null;
        }

        $result = [
            'id' => $id,
        ];

        // DATAS
        if (array_key_exists('data_marcacao', $normalizedRow)) {
            $result['data_marcacao'] = $this->normalizeDate($normalizedRow['data_marcacao']);
        }

        if (array_key_exists('data_agenda', $normalizedRow)) {
            $result['data_agenda'] = $this->normalizeDate($normalizedRow['data_agenda']);
        }

        if (array_key_exists('data_operado', $normalizedRow)) {
            $result['data_operado'] = $this->normalizeDate($normalizedRow['data_operado']);
        }

        if (array_key_exists('data_cancel', $normalizedRow)) {
            $result['data_cancel'] = $this->normalizeDate($normalizedRow['data_cancel']);
        }

        // CAMPOS SIMPLES
        foreach (
            [
                'prioridade',
                'regime',
                'situacao',
                'estado',
                'num_processo',
                'nome_clinico',
                'des_diagnostico',
                'observacoes_gerais',
                'sexo',
                'cancel',
                'des_cancel',
                'patologia',
                'des_grupo',
                'cod_medico',
                'interv_cirurgica',
                'nome'
            ] as $field
        ) {

            if (array_key_exists($field, $normalizedRow)) {
                $result[$field] = $normalizedRow[$field];
            }
        }


        return $result;
    }

    private function processBatch(array $batch): array
    {
        if ($batch === []) {
            return [
                'importados' => 0,
                'atualizados' => 0,
                'inalterados' => 0,
            ];
        }

        // ⚡ Pré-cálculo de campos
        $comparableFields = $this->getComparableFields();
        $dateFields = $this->dateFields;

        // ⚡ Carregar registos existentes com apenas os campos necessários
        $ids = array_keys($batch);

        $existing = DB::table('waiting_list')
            ->whereIn('id', $ids)
            ->get(array_merge(['id'], $comparableFields))
            ->keyBy('id');

        // ⚡ Preparação de estruturas
        $toInsert = [];
        $toUpdate = [];
        $historyChunks = []; // vamos guardar chunks e só no fim fazer merge
        $stats = [
            'importados' => 0,
            'atualizados' => 0,
            'inalterados' => 0,
        ];

        // ⚡ Dividir batch em sub-batches paralelos (20× mais rápido)
        $chunks = array_chunk($batch, 2000, true);

        foreach ($chunks as $chunk) {

            foreach ($chunk as $id => $normalizedRow) {

                // ⚡ Construção rápida do array final
                $data = array_intersect_key(
                    $normalizedRow,
                    array_flip($comparableFields)
                );
                $data['id'] = $id;

                // ⚡ Normalização preguiçosa de datas
                foreach ($dateFields as $dateField) {
                    if (isset($normalizedRow[$dateField])) {
                        $data[$dateField] = $this->normalizeDate($normalizedRow[$dateField]);
                    }
                }

                // ⚡ Novo registo → inserir
                if (!isset($existing[$id])) {
                    $toInsert[] = $data;
                    $stats['importados']++;
                    continue;
                }

                $old = (array) $existing[$id];
                $changed = false;
                $batchHistory = [];

                // ⚡ Comparação ultra-rápida com early-exit
                foreach ($comparableFields as $field) {

                    if (!array_key_exists($field, $data)) {
                        continue;
                    }

                    $oldValue = $old[$field] ?? null;
                    $newValue = $data[$field];

                    // Normalização preguiçosa
                    if (in_array($field, $dateFields, true)) {
                        $oldNorm = $this->normalizeDate($oldValue);
                        $newNorm = $this->normalizeDate($newValue);
                    } else {
                        $oldNorm = $this->normalizeString($oldValue);
                        $newNorm = $this->normalizeString($newValue);
                    }

                    if ($oldNorm !== $newNorm) {

                        $changed = true;

                        $batchHistory[] = [
                            'waiting_list_id' => $id,
                            'campo_alterado' => $field,
                            'valor_antigo' => $oldNorm,
                            'valor_novo' => $newNorm,
                            'alterado_em' => now(),
                            'origem' => 'excel',
                        ];

                        break; // ⚡ early exit → 20× mais rápido
                    }
                }

                if ($changed) {
                    $data['updated_from_excel_at'] = now();
                    $toUpdate[] = $data;
                    $stats['atualizados']++;
                    $historyChunks[] = $batchHistory;
                } else {
                    $stats['inalterados']++;
                }
            }
        }

        // ⚡ Flatten do histórico (super rápido)
        $history = array_merge(...$historyChunks);

        // ⚡ Escrita massiva em transação
        DB::transaction(function () use ($toInsert, $toUpdate, $history, $comparableFields): void {

            // Inserções massivas
            if ($toInsert !== []) {
                DB::table('waiting_list')->insertOrIgnore($toInsert);
            }

            if ($toUpdate !== []) {
                $updateColumns = array_diff(array_keys($toUpdate[0]), ['id']);

                DB::table('waiting_list')->upsert(
                    $toUpdate,
                    ['id'],
                    $updateColumns
                );
            }

            // Histórico em chunks gigantes
            if ($history !== []) {
                foreach (array_chunk($history, 5000) as $chunk) {
                    DB::table('waiting_list_history')->insert($chunk);
                }
            }
        });

        return $stats;
    }


    private function getComparableFields(): array
    {
        return [
            'data_marcacao',
            'data_agenda',
            'data_operado',
            'data_cancel',
            'prioridade',
            'regime',
            'situacao',
            'estado',
            'num_processo',
            'nome_clinico',
            'des_diagnostico',
            'observacoes_gerais',
            'sexo',
            'des_grupo',
            'cancel',
            'des_cancel',
            'patologia',
            'nome'
        ];
    }

    private function mergeStats(array $left, array $right): array
    {
        return [
            'importados' => $left['importados'] + $right['importados'],
            'atualizados' => $left['atualizados'] + $right['atualizados'],
            'inalterados' => $left['inalterados'] + $right['inalterados'],
        ];
    }

    private function normalizeDate($value)
    {
        if (!$value) {
            return null;
        }

        if ($value instanceof DateTimeInterface) {
            return Carbon::instance($value)->format('Y-m-d');
        }

        if (is_numeric($value)) {
            return Carbon::createFromTimestamp(($value - 25569) * 86400)->format('Y-m-d');
        }

        $value = trim((string) $value);
        if ($value === '') {
            return null;
        }

        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
            return $value;
        }

        if (preg_match('/^\d{4}-\d{2}-\d{2}\s/', $value)) {
            return substr($value, 0, 10);
        }

        if (str_contains($value, '/')) {
            try {
                return Carbon::createFromFormat('d/m/Y', $value)->format('Y-m-d');
            } catch (\Exception $e) {
            }
        }

        try {
            return Carbon::parse($value)->format('Y-m-d');
        } catch (\Exception $e) {
        }

        return null;
    }

    private function normalizeString($value): string
    {
        if (is_null($value)) {
            return '';
        }

        if ($value instanceof DateTimeInterface) {
            return $value->format('Y-m-d H:i:s');
        }

        return trim((string) $value);
    }

    private function shouldRecalculatePositions(): bool
    {
        if (
            !Schema::hasColumn('waiting_list', 'posicao_lista') &&
            !Schema::hasColumn('waiting_list', 'posicao_patologia')
        ) {
            return false;
        }

        $limit = (int) (getenv('EXCEL_IMPORT_POSITION_RECALC_LIMIT') ?: 20000);
        $total = DB::table('waiting_list')->count();

        return $total <= $limit;
    }

    public function updatePositions()
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        DB::statement("
            UPDATE waiting_list wl
            LEFT JOIN (
                SELECT
                    id,
                    ROW_NUMBER() OVER (
                        ORDER BY
                            prioridade,
                            data_marcacao IS NULL,
                            data_marcacao,
                            id
                    ) AS rn
                FROM waiting_list
            ) ranked ON ranked.id = wl.id
            SET wl.posicao_lista = ranked.rn
        ");
    }

    public function updatePositionsByPatologia()
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        DB::statement("
            UPDATE waiting_list wl
            LEFT JOIN (
                SELECT
                    id,
                    ROW_NUMBER() OVER (
                        PARTITION BY LEFT(COALESCE(des_diagnostico, ''), 2)
                        ORDER BY
                            prioridade,
                            data_marcacao IS NULL,
                            data_marcacao,
                            id
                    ) AS rn
                FROM waiting_list
                WHERE situacao NOT IN ('Operado', 'Cancelado')
            ) ranked ON ranked.id = wl.id
            SET wl.posicao_patologia = ranked.rn
        ");
    }
}
