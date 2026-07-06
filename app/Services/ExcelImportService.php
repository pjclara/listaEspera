<?php

namespace App\Services;

class ExcelImportService
{
    public function import($file)
    {
        // Garantir que a pasta existe
        $folder = storage_path('app/excel_uploads');
        if (!is_dir($folder)) {
            mkdir($folder, 0777, true);
        }

        // Nome único para evitar conflitos
        $filename = 'import_' . time() . '.xlsx';

        // Guardar ficheiro
        $file->move($folder, $filename);

        // Caminho completo
        $fullPath = $folder . '/' . $filename;

        // Verificar se o ficheiro existe
        if (!file_exists($fullPath)) {
            throw new \Exception("Ficheiro não encontrado: " . $fullPath);
        }

        // Caminho do script Python
        $script = base_path('python/import_excel.py');

        // Executar Python
        $command = "python " . escapeshellarg($script) . " " . escapeshellarg($fullPath);
        $output = shell_exec($command);

        return json_decode($output, true);
    }
}
