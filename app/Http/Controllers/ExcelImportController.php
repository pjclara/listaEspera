<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\ExcelImportService;
use Inertia\Inertia;

class ExcelImportController extends Controller
{
    public function import(Request $request)
    {
        set_time_limit(0);
        ini_set('max_execution_time', 0);

        $request->validate([
            'file' => 'required|file|mimes:xlsx'
        ]);

        $uploadedFile = $request->file('file');
        $extension = strtolower($uploadedFile->getClientOriginalExtension());

        if ($extension !== 'xlsx') {
            return redirect()->back()->withErrors(['file' => 'Apenas ficheiros .xlsx são suportados pelo importador atual.']);
        }

        $importService = new ExcelImportService();
        $importService->import($uploadedFile->path(), $extension);

        return redirect()->back()->with('success', 'Arquivo importado com sucesso.');
    }

    public function page()
    {
        return Inertia::render('WaitingList/Import');
    }
}
