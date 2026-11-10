<?php

use App\Services\ExcelImportService;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

function makeXlsxFixture(array $headers, array $row): string
{
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();

    foreach ($headers as $col => $header) {
        $sheet->setCellValueByColumnAndRow($col + 1, 1, $header);
    }

    foreach ($row as $col => $value) {
        $sheet->setCellValueByColumnAndRow($col + 1, 2, $value);
    }

    $path = tempnam(sys_get_temp_dir(), 'xlsx') . '.xlsx';
    (new Xlsx($spreadsheet))->save($path);

    return $path;
}

test('import reconhece a coluna Nome_clinico independentemente da capitalização', function () {
    $path = makeXlsxFixture(
        ['NUM_LISTA_ESPERA', 'DES_GRUPO', 'Nome_clinico'],
        [101, 'HSA - Cirurgia', 'Dr. João Silva'],
    );

    (new ExcelImportService())->import($path, 'xlsx');

    @unlink($path);

    $this->assertDatabaseHas('waiting_list', [
        'id' => 101,
        'nome_clinico' => 'Dr. João Silva',
    ]);
});
