<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Log;


class ExcelChunkProcessor
{
    private array $toInsert = [];
    private array $toUpdate = [];
    private array $history = [];

    private array $existingCache = [];

    private int $imported = 0;
    private int $updated = 0;
    private int $unchanged = 0;

    public function processChunk($rows)
    {
        // Coleta os IDs do chunk
        $ids = [];

        foreach ($rows as $index => $row) {

            if ($index === 0) continue;
            if (empty($row[0]) || !is_numeric($row[0])) continue;
            if (($row[10] ?? '') !== "HSA - CIRURGIA") continue;

            $ids[] = (int) $row[0];
        }

        // Busca todos os registros existentes de uma vez
        $this->existingCache = DB::table('waiting_list')
            ->whereIn('id', $ids)
            ->get()
            ->keyBy('id')
            ->toArray();

        // Processa as linhas
        foreach ($rows as $index => $row) {

            if ($index === 0) continue;
            if (empty($row[0]) || !is_numeric($row[0])) continue;
            if (($row[10] ?? '') !== "HSA - CIRURGIA") continue;

            $id = (int) $row[0];

            $data = [
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

            $existing = $this->existingCache[$id] ?? null;

            if (!$existing) {
                $this->toInsert[] = $data;
                $this->imported++;
            } else {

                $old = (array) $existing;
                $changed = false;

                foreach ($data as $field => $newValue) {

                    $oldNorm = $this->normalizeCompare($field, $old[$field] ?? null);
                    $newNorm = $this->normalizeCompare($field, $newValue);

                    if ($oldNorm !== $newNorm) {

                        $changed = true;

                        $this->history[] = [
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
                    $this->toUpdate[] = $data;
                    $this->updated++;
                } else {
                    $this->unchanged++;
                }
            }

            // Inserções em lote
            if (count($this->toInsert) >= 500) {
                DB::table('waiting_list')->insert($this->toInsert);
                $this->toInsert = [];
            }

            // Atualizações em lote
            if (count($this->toUpdate) >= 500) {

                $columns = array_diff(
                    array_keys($this->toUpdate[0]),
                    ['id']
                );

                DB::table('waiting_list')->upsert(
                    $this->toUpdate,
                    ['id'],
                    $columns
                );

                $this->toUpdate = [];
            }

            // Histórico em lote
            if (count($this->history) >= 1000) {
                DB::table('waiting_list_history')->insert($this->history);
                $this->history = [];
            }
        }

        // Libera memória do chunk
        $this->existingCache = [];
    }

    public function finalize()
    {
        if (!empty($this->toInsert)) {
            DB::table('waiting_list')->insert($this->toInsert);
        }

        if (!empty($this->toUpdate)) {
            DB::table('waiting_list')->upsert(
                $this->toUpdate,
                ['id'],
                array_keys($this->toUpdate[0])
            );
        }

        if (!empty($this->history)) {
            DB::table('waiting_list_history')->insert($this->history);
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
            "importados" => $this->imported,
            "atualizados" => $this->updated,
            "inalterados" => $this->unchanged,
        ];
    }

    private function normalizeCompare($field, $value)
    {
        if (in_array($field, ['data_marcacao', 'data_operado', 'data_agenda', 'data_cancel'])) {
            return $this->normalizeDate($value);
        }

        return trim((string)$value);
    }

    private function normalizeDate($value)
    {
        if (!$value) return null;

        if (is_numeric($value)) {
            return Carbon::createFromTimestamp(($value - 25569) * 86400)->format("Y-m-d");
        }

        $value = trim((string)$value);

        if ($value === "") return null;

        if (preg_match('/^\d{4}-\d{2}-\d{2}/', $value)) {
            return substr($value, 0, 10);
        }

        if (str_contains($value, "/")) {
            try {
                return Carbon::createFromFormat("d/m/Y", $value)->format("Y-m-d");
            } catch (\Exception $e) {
            }
        }

        try {
            return Carbon::parse($value)->format("Y-m-d");
        } catch (\Exception $e) {
        }

        return $value;
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

    private function shouldRecalculatePositions(): bool
    {
        if (!Schema::hasColumn('waiting_list', 'posicao_lista') && !Schema::hasColumn('waiting_list', 'posicao_patologia')) {
            return false;
        }

        $limit = (int) (getenv('EXCEL_IMPORT_POSITION_RECALC_LIMIT') ?: 20000);
        $total = DB::table('waiting_list')->count();

        return $total <= $limit;
    }
}
