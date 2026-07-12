<?php

namespace App\Services;

use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class ExcelImportService
{
    public function import($file)
    {
        $sheets = Excel::toArray([], $file);
        $rows = $sheets[0] ?? [];

        if (empty($rows)) {
            return [
                "importados" => 0,
                "atualizados" => 0,
                "inalterados" => 0,
            ];
        }


        $parsedRows = [];
        $ids = [];

        foreach ($rows as $index => $row) {
            if ($index === 0) continue;
            if (empty($row[0]) || !is_numeric($row[0])) continue;
            if (($row[10] ?? '') !== "HSA - CIRURGIA") continue;

            $id = intval($row[0]);

            $parsedRows[$id] = [
                "id"                => $id,
                "data_marcacao"     => $this->normalizeDate($row[1] ?? null),
                "prioridade"        => $row[2] ?? "",
                "regime"            => $row[3] ?? "",
                "situacao"          => $row[4] ?? "",
                "estado"            => $row[5] ?? "",
                "data_operado"      => $this->normalizeDate($row[6] ?? null),
                "data_agenda"       => $this->normalizeDate($row[7] ?? null),
                "num_processo"      => $row[8] ?? "",
                "sexo"              => $row[9] ?? "",
                "des_grupo"         => $row[10] ?? "",
                "cod_medico"        => $row[11] ?? "",
                "nome_clinico"      => $row[12] ?? "",
                "patologia"         => $row[13] ?? "",
                "des_diagnostico"   => $row[14] ?? "",
                "interv_cirurgica"  => $row[15] ?? "",
                "data_cancel"       => $this->normalizeDate($row[16] ?? null),
                "cancel"            => $row[17] ?? "",
                "des_cancel"        => $row[18] ?? "",
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

        // Carregar apenas registos que vêm no Excel (em vez da tabela toda)
        $existing = DB::table('waiting_list')->whereIn('id', $ids)->get()->keyBy('id');

        $toInsert = [];
        $toUpdate = [];
        $history = [];

        $imported = 0;
        $updated = 0;
        $unchanged = 0;

        foreach ($parsedRows as $id => $data) {

            // 2) Verificar se existe em memória (sem SELECT)
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
                    $newNorm = $newValue;
                } else {
                    $oldNorm = trim((string)$oldValue);
                    $newNorm = trim((string)$newValue);
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

        // 3) Bulk insert (muito mais rápido)
        if (!empty($toInsert)) {
            DB::table('waiting_list')->insert($toInsert);
        }

        // 4) Bulk update (via upsert)
        if (!empty($toUpdate)) {
            DB::table('waiting_list')->upsert(
                $toUpdate,
                ['id'], // chave
                array_keys($toUpdate[0]) // campos a atualizar
            );
        }

        // 5) Bulk insert do histórico
        if (!empty($history)) {
            DB::table('waiting_list_history')->insert($history);
        }

        if ($this->shouldRecalculatePositions()) {
            $this->updatePositions();
            $this->updatePositionsByPatologia();
        } else {
            Log::warning('Excel import: recálculo de posições adiado por volume elevado.', [
                'total_waiting_list' => DB::table('waiting_list')->count(),
            ]);
        }


        return [
            "importados" => $imported,
            "atualizados" => $updated,
            "inalterados" => $unchanged,
        ];
    }

    public function updatePositionsByPatologia()
    {
        if (! Schema::hasColumn('waiting_list', 'posicao_patologia')) {
            return;
        }

        DB::statement("
            UPDATE waiting_list wl
            LEFT JOIN (
                SELECT
                    id,
                    ROW_NUMBER() OVER (
                        PARTITION BY LEFT(COALESCE(patologia, ''), 2)
                        ORDER BY prioridade, data_marcacao, id
                    ) AS rn
                FROM waiting_list
                WHERE estado NOT IN ('F', 'C')
                  AND situacao NOT IN ('Operado', 'Cancelado')
            ) ranked ON ranked.id = wl.id
            SET wl.posicao_patologia = ranked.rn
        ");
    }


    public function updatePositions()
    {
        if (! Schema::hasColumn('waiting_list', 'posicao_lista')) {
            return;
        }

        DB::statement("
            UPDATE waiting_list wl
            LEFT JOIN (
                SELECT
                    id,
                    ROW_NUMBER() OVER (
                        ORDER BY prioridade, data_marcacao, id
                    ) AS rn
                FROM waiting_list
                WHERE estado NOT IN ('F', 'C')
                  AND situacao NOT IN ('Operado', 'Cancelado')
            ) ranked ON ranked.id = wl.id
            SET wl.posicao_lista = ranked.rn
        ");
    }



    private function normalizeDate($value)
    {
        if (!$value) return null;

        // Excel date serial
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

        // dd/mm/yyyy
        if (str_contains($value, "/")) {
            try {
                return Carbon::createFromFormat("d/m/Y", $value)->format("Y-m-d");
            } catch (\Exception $e) {
            }
        }

        // yyyy-mm-dd hh:mm:ss
        try {
            return Carbon::parse($value)->format("Y-m-d");
        } catch (\Exception $e) {
        }

        return $value;
    }

    private function shouldRecalculatePositions(): bool
    {
        if (!Schema::hasColumn('waiting_list', 'posicao_lista') && !Schema::hasColumn('waiting_list', 'posicao_patologia')) {
            return false;
        }

        $limit = (int) (getenv('EXCEL_IMPORT_POSITION_RECALC_LIMIT') ?: 20000);
        $total = DB::table('waiting_list')->count();

        return $total <= $limit;
    }

    private function saveHistory($id, $field, $old, $new)
    {
        DB::table('waiting_list_history')->insert([
            "waiting_list_id" => $id,
            "campo_alterado"  => $field,
            "valor_antigo"    => $old,
            "valor_novo"      => $new,
            "alterado_em"     => Carbon::now(),
            "origem"          => "excel",
        ]);
    }
}
