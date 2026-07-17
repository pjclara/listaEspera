<?php

namespace App\Services;

use DateTimeInterface;
use Spatie\SimpleExcel\SimpleExcelReader;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class ExcelImportService
{
    public function import($file, string $type = 'xlsx')
    {
        // Lê o Excel com cabeçalho
        $rows = SimpleExcelReader::create($file, $type)->getRows();

        $parsedRows = [];
        $ids = [];

        // Mapa de equivalências de cabeçalhos
        $headerMap = [
            // ID
            'Nº LISTA'          => 'id',
            'NUM_LISTA'         => 'id',
            'LISTA'             => 'id',

            // Datas
            'DTA_INSCR'         => 'data_marcacao',
            'DTA_TMRG'          => 'data_marcacao',
            'DATA_INSCRICAO'    => 'data_marcacao',

            'DTA_AGEN'          => 'data_agenda',
            'DATA_AGENDA'       => 'data_agenda',

            // Prioridade
            'PRIORIDADE'        => 'prioridade',
            'PR'                => 'prioridade',

            // Regime
            'Regime'            => 'regime',
            'Regim'             => 'regime',

            // Situação
            'Situacao'          => 'situacao',
            'SITUACAO'          => 'situacao',

            // Diagnóstico
            'DES_DIAGNOSTICO'   => 'des_diagnostico',
            'DES_DIAGNOSTIC'    => 'des_diagnostico',

            // Nome clínico
            'NOME_CLINICO'      => 'nome_clinico',
            'NOME_CLIN'         => 'nome_clinico',

            // Observações
            'OBSERVACOES'       => 'observacoes_gerais',
            'OBSER'             => 'observacoes_gerais',
        ];

        foreach ($rows as $row) {

            // Converter cabeçalhos → nomes internos
            $normalizedRow = [];

            foreach ($row as $colName => $value) {
                $colName = trim($colName);

                if (isset($headerMap[$colName])) {
                    $normalizedRow[$headerMap[$colName]] = $value;
                }
            }

            // Extrair ID
            $id = intval($normalizedRow['id'] ?? 0);
            if ($id === 0) continue;

            // Construir linha final
            $parsedRows[$id] = [
                "id"                => $id,
                "data_marcacao"     => $this->normalizeDate($normalizedRow['data_marcacao'] ?? null),
                "prioridade"        => $normalizedRow['prioridade'] ?? "",
                "regime"            => $normalizedRow['regime'] ?? "",
                "situacao"          => $normalizedRow['situacao'] ?? "",
                "data_agenda"       => $this->normalizeDate($normalizedRow['data_agenda'] ?? null),
                "num_processo"      => $normalizedRow['num_processo'] ?? "",
                "nome_clinico"      => $normalizedRow['nome_clinico'] ?? "",
                "des_diagnostico"   => $normalizedRow['des_diagnostico'] ?? "",
                "observacoes_gerais" => $normalizedRow['observacoes_gerais'] ?? "",
            ];

            $ids[] = $id;
        }

        if (empty($ids)) {
            return [
                "importados" => 0,
                "atualizados" => 0,
                "inalterados" => 0,
            ];
        }

        // Carregar apenas os IDs presentes no Excel
        $existing = DB::table('waiting_list')->whereIn('id', $ids)->get()->keyBy('id');

        $toInsert = [];
        $toUpdate = [];
        $history = [];

        $imported = 0;
        $updated = 0;
        $unchanged = 0;

        foreach ($parsedRows as $id => $data) {

            if (!isset($existing[$id])) {
                $toInsert[] = $data;
                $imported++;
                continue;
            }

            $old = (array) $existing[$id];
            $changed = false;

            foreach ($data as $field => $newValue) {

                $oldValue = $old[$field];

                if (in_array($field, ['data_marcacao', 'data_operado', 'data_agenda', 'data_cancel'], true)) {
                    $oldNorm = $this->normalizeDate($oldValue);
                    $newNorm = $this->normalizeDate($newValue);
                } else {
                    $oldNorm = $this->normalizeString($oldValue);
                    $newNorm = $this->normalizeString($newValue);
                }

                if ($oldNorm !== $newNorm) {
                    $changed = true;

                    $history[] = [
                        'waiting_list_id' => $id,
                        'campo_alterado'  => $field,
                        'valor_antigo'    => $oldNorm,
                        'valor_novo'      => $newNorm,
                        'alterado_em'     => now(),
                        'origem'          => 'excel',
                    ];
                }
            }

            if ($changed) {
                $data['updated_from_excel_at'] = now();
                $toUpdate[] = $data;
                $updated++;
            } else {
                $unchanged++;
            }
        }

        // Inserções
        if (!empty($toInsert)) {
            DB::table('waiting_list')->insert($toInsert);
        }

        // Atualizações via UPSERT
        if (!empty($toUpdate)) {
            DB::table('waiting_list')->upsert(
                $toUpdate,
                ['id'],
                array_keys($toUpdate[0])
            );
        }

        // Histórico
        if (!empty($history)) {
            DB::table('waiting_list_history')->insert($history);
        }

        // Recalcular posições
        if ($this->shouldRecalculatePositions()) {
            $this->updatePositions();
            $this->updatePositionsByPatologia();
        }

        return [
            "importados" => $imported,
            "atualizados" => $updated,
            "inalterados" => $unchanged,
        ];
    }

    private function normalizeDate($value)
    {
        if (!$value) return null;

        if ($value instanceof DateTimeInterface) {
            return Carbon::instance($value)->format('Y-m-d');
        }

        if (is_numeric($value)) {
            return Carbon::createFromTimestamp(($value - 25569) * 86400)->format("Y-m-d");
        }

        $value = trim((string)$value);
        if ($value === "") return null;

        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
            return $value;
        }

        if (preg_match('/^\d{4}-\d{2}-\d{2}\s/', $value)) {
            return substr($value, 0, 10);
        }

        if (str_contains($value, "/")) {
            try {
                return Carbon::createFromFormat("d/m/Y", $value)->format("Y-m-d");
            } catch (\Exception $e) {}
        }

        try {
            return Carbon::parse($value)->format("Y-m-d");
        } catch (\Exception $e) {}

        return null;
    }

    private function normalizeString($value): string
    {
        if (is_null($value)) return '';

        if ($value instanceof DateTimeInterface) {
            return $value->format('Y-m-d H:i:s');
        }

        return trim((string)$value);
    }

    private function shouldRecalculatePositions(): bool
    {
        if (!Schema::hasColumn('waiting_list', 'posicao_lista') &&
            !Schema::hasColumn('waiting_list', 'posicao_patologia')) {
            return false;
        }

        $limit = (int) (getenv('EXCEL_IMPORT_POSITION_RECALC_LIMIT') ?: 20000);
        $total = DB::table('waiting_list')->count();

        return $total <= $limit;
    }

    public function updatePositions()
    {
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
