<?php

namespace App\Http\Controllers;

use App\Services\ExcelImportService;
use Illuminate\Http\Request;

class ExcelImportController extends Controller
{
    public function import(Request $request, ExcelImportService $service)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls'
        ]);

        $result = $service->import($request->file('file'));

        return response()->json($result);
    }
}


