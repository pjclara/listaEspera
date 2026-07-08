<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class WaitingListExport implements FromCollection, WithHeadings
{
    public function __construct($data)
    {
        $this->data = $data;

    }

    public function collection()
    {
        return $this->data->map(function ($item) {
            return [
                'ID' => $item->id,
                'Nº Processo' => $item->num_processo,
                'Situação' => $item->situacao,
                'Estado' => $item->estado,
                'Diagnóstico' => $item->des_diagnostico,
                'Data Marcação' => $item->data_marcacao,
                'Data Operado' => $item->data_operado,
                'Data Agenda' => $item->data_agenda,
            ];
        });
    }

    public function headings(): array
    {
        return [
            'ID',
            'Nº Processo',
            'Situação',
            'Estado',
            'Diagnóstico',
            'Data Marcação',
            'Data Operado',
            'Data Agenda',
        ];
    }
}
