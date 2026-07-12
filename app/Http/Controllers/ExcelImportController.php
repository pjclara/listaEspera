<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Excel as ExcelType;
use App\Imports\WaitingListChunkImport;
use Inertia\Inertia;

class ExcelImportController extends Controller
{




public function import(Request $request)
{
    set_time_limit(0);
    ini_set('max_execution_time', 0);
    
    $request->validate([
        'file' => 'required|file|mimes:xlsx,xls'
    ]);

    Excel::import(
        new WaitingListChunkImport(),
        $request->file('file')
    );

    return redirect()->back()->with('success', 'Arquivo importado com sucesso.');
}



    public function page()
    {
        return Inertia::render('WaitingList/Import');
    }
}
