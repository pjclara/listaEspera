<?php

namespace App\Imports;

use App\Services\ExcelChunkProcessor;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Illuminate\Support\Collection;

class WaitingListChunkImport implements ToCollection, WithChunkReading
{
    protected ExcelChunkProcessor $processor;

    public function __construct()
    {
        $this->processor = new ExcelChunkProcessor();
    }

    public function collection(Collection $rows)
    {
        $this->processor->processChunk($rows);
    }

    public function chunkSize(): int
    {
        return 500;
    }

    public function __destruct()
    {
        $this->processor->finalize();
    }
}