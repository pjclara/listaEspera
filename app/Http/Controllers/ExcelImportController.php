<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\ExcelImportService;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Spatie\SimpleExcel\SimpleExcelReader;

class ExcelImportController extends Controller
{
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls'
        ]);

        $uploadedFile = $request->file('file');
        $extension = strtolower($uploadedFile->getClientOriginalExtension());
        $path = $uploadedFile->path();

        // Se for XLS → converter para XLSX
        if ($extension === 'xls') {
            $spreadsheet = IOFactory::load($path);
            $newPath = $path . '.xlsx';

            $writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
            $writer->save($newPath);

            $path = $newPath;   // usar o novo ficheiro
            $extension = 'xlsx';
        }



        // Chamar o teu serviço
        $importService = new ExcelImportService();
        $importService->import($path, $extension);

        return back()->with('success', 'Arquivo importado com sucesso.');
    }

    public function page()
    {
        return Inertia::render('WaitingList/Import');
    }
}
