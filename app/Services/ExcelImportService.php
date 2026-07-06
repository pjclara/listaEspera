<?php

namespace App\Services;

use App\Models\WaitingList;
use App\Models\WaitingListHistory;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;

class ExcelImportService
{
    public function import($file)
    {
        $rows = Excel::toArray([], $file)[0]; // primeira sheet

        $imported = 0;
        $updated = 0;
        $unchanged = 0;

        foreach ($rows as $row) {

            // Ignorar cabeçalho
            if (!is_numeric($row[0])) {
                continue;
            }

            $id = $row[0];

            // Mapear colunas do Excel → campos da BD
            $data = [
                'id' => $row[0],
                'data_inscricao' => $this->excelDate($row[1]),
                'prioridade' => $row[3],
                'origem' => $row[4],
                'estado' => $row[5],
                'sexo' => $row[6],
                'episodio_id' => $row[8],
                'instituicao' => $row[9],
                'medico_id' => $row[10],
                'medico_nome' => $row[11],
                'diagnostico_cid' => $row[12],
                'diagnostico_desc' => $row[13],
                'procedimento_pcs' => $row[14],
                'data_prevista' => $this->excelDate($row[15]),
                'duracao_estimada' => $row[16],
                'motivo_cancelamento' => $row[17],
                'updated_from_excel_at' => now(),
            ];

            $existing = WaitingList::find($id);

            if (!$existing) {
                // Criar novo registo
                WaitingList::create($data);
                $imported++;
                continue;
            }

            // Verificar alterações campo a campo
            $changed = false;

            foreach ($data as $field => $value) {
                if ($existing->$field != $value) {
                    $changed = true;

                    // Guardar histórico
                    WaitingListHistory::create([
                        'waiting_list_id' => $existing->id,
                        'campo_alterado' => $field,
                        'valor_antigo' => $existing->$field,
                        'valor_novo' => $value,
                        'alterado_em' => now(),
                        'origem' => 'excel',
                    ]);

                    $existing->$field = $value;
                }
            }

            if ($changed) {
                $existing->save();
                $updated++;
            } else {
                $unchanged++;
            }
        }

        return [
            'importados' => $imported,
            'atualizados' => $updated,
            'inalterados' => $unchanged,
        ];
    }

    private function excelDate($value)
    {
        if (!$value) return null;

        // Se vier como string "03/01/2025"
        if (str_contains($value, '/')) {
            return Carbon::createFromFormat('d/m/Y', $value)->format('Y-m-d');
        }

        // Se vier como número (data Excel)
        return Carbon::instance(\PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($value))
            ->format('Y-m-d');
    }
}
