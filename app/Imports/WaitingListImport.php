<?php

namespace App\Imports;

use App\Models\WaitingList;
use App\Models\WaitingListHistory;
use Carbon\Carbon;
use Maatwebsite\Excel\Row;
use Maatwebsite\Excel\Concerns\OnEachRow;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class WaitingListImport implements OnEachRow, WithHeadingRow
{
    public function onRow(Row $row)
    {
        $r = $row->toArray();

        // Ignorar linhas sem ID
        if (!isset($r['id']) || !is_numeric($r['id'])) {
            return;
        }

        $id = $r['id'];

        $data = [
            'id' => $r['id'],
            'data_inscricao' => $this->excelDate($r['data_inscricao']),
            'prioridade' => $r['prioridade'],
            'origem' => $r['origem'],
            'estado' => $r['estado'],
            'sexo' => $r['sexo'],
            'episodio_id' => $r['episodio_id'],
            'instituicao' => $r['instituicao'],
            'medico_id' => $r['medico_id'],
            'medico_nome' => $r['medico_nome'],
            'diagnostico_cid' => $r['diagnostico_cid'],
            'diagnostico_desc' => $r['diagnostico_desc'],
            'procedimento_pcs' => $r['procedimento_pcs'],
            'data_prevista' => $this->excelDate($r['data_prevista']),
            'duracao_estimada' => $r['duracao_estimada'],
            'motivo_cancelamento' => $r['motivo_cancelamento'],
            'updated_from_excel_at' => now(),
        ];

        dd($data);

        $existing = WaitingList::find($id);

        if (!$existing) {
            WaitingList::create($data);
            return;
        }

        foreach ($data as $field => $value) {
            if ($existing->$field != $value) {
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

        $existing->save();
    }

    private function excelDate($value)
    {
        if (!$value) return null;

        if (str_contains($value, '/')) {
            return Carbon::createFromFormat('d/m/Y', $value)->format('Y-m-d');
        }

        return Carbon::instance(
            \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($value)
        )->format('Y-m-d');
    }
}
