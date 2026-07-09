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

        dd($result);
        return back()->with('toast', [
            'type' => 'success',
            'title' => 'Importação concluída',
            'description' => "{$result['importados']} registros importados, {$result['atualizados']} registros atualizados, {$result['inalterados']} registros sem alterações."
        ]);
    }

    public function page()
    {
        return Inertia::render('WaitingList/Import');
    }
}
