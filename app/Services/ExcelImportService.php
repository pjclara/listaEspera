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

        return [
            'id' => $id,
            'data_marcacao' => $this->normalizeDate($normalizedRow['data_marcacao'] ?? null),
            'data_agenda' => $this->normalizeDate($normalizedRow['data_agenda'] ?? null),
            'data_operado' => $this->normalizeDate($normalizedRow['data_operado'] ?? null),
            'data_cancel' => $this->normalizeDate($normalizedRow['data_cancel'] ?? null),
            'prioridade' => $normalizedRow['prioridade'] ?? '',
            'regime' => $normalizedRow['regime'] ?? '',
            'situacao' => $normalizedRow['situacao'] ?? '',
            'estado' => $normalizedRow['estado'] ?? '',
            'num_processo' => $normalizedRow['num_processo'] ?? '',
            'nome_clinico' => $normalizedRow['nome_clinico'] ?? '',
            'des_diagnostico' => $normalizedRow['des_diagnostico'] ?? '',
            'observacoes_gerais' => $normalizedRow['observacoes_gerais'] ?? '',
            'sexo' => $normalizedRow['sexo'] ?? '',
            'cancel' => $normalizedRow['cancel'] ?? '',
            'des_cancel' => $normalizedRow['des_cancel'] ?? '',
            'patologia' => $normalizedRow['patologia'] ?? '',
            'des_grupo'          => $normalizedRow['des_grupo'] ?? '',
            'cod_medico'         => $normalizedRow['cod_medico'] ?? null,
            'interv_cirurgica'   => $normalizedRow['interv_cirurgica'] ?? '',
        ];
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

        $ids = array_keys($batch);
        $existing = DB::table('waiting_list')->whereIn('id', $ids)->get()->keyBy('id');

        $toInsert = [];
        $toUpdate = [];
        $history = [];
        $stats = [
            'importados' => 0,
            'atualizados' => 0,
            'inalterados' => 0,
        ];

        foreach ($batch as $id => $data) {
            if (!isset($existing[$id])) {
                $toInsert[] = $data;
                $stats['importados']++;
                continue;
            }

            $old = (array) $existing[$id];
            $changed = false;
            $batchHistory = [];

            foreach ($this->getComparableFields() as $field) {
                $oldValue = $old[$field] ?? null;
                $newValue = $data[$field] ?? null;
                $oldNorm = $this->normalizeComparableValue($field, $oldValue);
                $newNorm = $this->normalizeComparableValue($field, $newValue);

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
                }
            }

            if ($changed) {
                $data['updated_from_excel_at'] = now();
                $toUpdate[] = $data;
                $stats['atualizados']++;
                $history = array_merge($history, $batchHistory);
            } else {
                $stats['inalterados']++;
            }
        }



        DB::transaction(function () use ($toInsert, $toUpdate, $history): void {
            $this->saveInsertBatch($toInsert);
            $this->saveUpsertBatch($toUpdate);
            $this->saveHistory($history);
        });

        return $stats;
    }

    private function saveInsertBatch(array $rows): void
    {
        if ($rows === []) {
            return;
        }

        foreach (array_chunk($rows, 1000) as $chunk) {
            DB::table('waiting_list')->insert($chunk);
        }
    }

    private function saveUpsertBatch(array $rows): void
    {
        if ($rows === []) {
            return;
        }

        foreach (array_chunk($rows, 1000) as $chunk) {
            DB::table('waiting_list')->upsert($chunk, ['id'], array_keys($chunk[0]));
        }
    }

    private function saveHistory(array $history): void
    {
        if ($history === []) {
            return;
        }

        foreach (array_chunk($history, 1000) as $chunk) {
            DB::table('waiting_list_history')->insert($chunk);
        }
    }

    private function normalizeComparableValue(string $field, $value)
    {
        if (in_array($field, $this->dateFields, true)) {
            return $this->normalizeDate($value);
        }

        return $this->normalizeString($value);
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
                        PARTITION BY LEFT(COALESCE(patologia, ''), 2)
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
