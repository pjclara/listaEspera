<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\ExcelImportService;
use Inertia\Inertia;

class ExcelImportController extends Controller
{
    public function import(Request $request, ExcelImportService $service)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls'
        ]);

        $result = $service->import($request->file('file'));

        return back()->with([
            'success' => 'Importação concluída',
            'result' => $result
        ]);
    }

    public function page()
    {
        return Inertia::render('WaitingList/Import');
    }
}
