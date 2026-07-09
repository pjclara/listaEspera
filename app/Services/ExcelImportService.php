<?php

namespace App\Services;

use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ExcelImportService
{
    public function import($file)
    {
        $rows = Excel::toArray([], $file)[0]; // primeira sheet

        $imported = 0;
        $updated = 0;
        $unchanged = 0;

        foreach ($rows as $index => $row) {

            // Ignorar header
            if ($index === 0) continue;

            // Garantir que existe NUM_LISTA_ESPERA
            if (empty($row[0]) || !is_numeric($row[0])) continue;

            $id = intval($row[0]);

            // Só importar cirurgias
            if (($row[10] ?? '') !== "HSA - CIRURGIA") continue;

            // Mapear colunas
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


            $existing = DB::table('waiting_list')->where('id', $id)->first();

            if (!$existing) {
                DB::table('waiting_list')->insert($data);
                $imported++;
                continue;
            }

            $changed = false;

            foreach ($data as $field => $newValue) {
                $oldValue = $existing->$field;

                $oldNorm = $this->normalizeDate($oldValue);
                $newNorm = $this->normalizeDate($newValue);

                if ($oldNorm != $newNorm) {
                    $changed = true;
                    $this->saveHistory($id, $field, $oldNorm, $newNorm);
                }
            }

            if ($changed) {
                $timestamp = Carbon::now()->format("Y-m-d H:i:s");

                $this->saveHistory(
                    $id,
                    "updated_from_excel_at",
                    $existing->updated_from_excel_at ?? "",
                    $timestamp
                );

                $data["updated_from_excel_at"] = $timestamp;

                DB::table('waiting_list')->where('id', $id)->update($data);

                $updated++;
            } else {
                $unchanged++;
            }
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

        // Excel date serial
        if (is_numeric($value)) {
            return Carbon::createFromTimestamp(($value - 25569) * 86400)->format("Y-m-d");
        }

        $value = trim((string)$value);

        if ($value === "") return null;

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

        return null;
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
