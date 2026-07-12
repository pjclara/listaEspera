<?php

namespace Database\Seeders;

use App\Models\WaitingListHistory;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Seeder;

class WaitingListHistorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $ids = DB::table('waiting_list')->orderBy('id')->pluck('id')->take(4);

        foreach ($ids as $index => $id) {
            WaitingListHistory::query()->create([
                'waiting_list_id' => $id,
                'campo_alterado' => 'prioridade',
                'valor_antigo' => (string) (3 - ($index % 2)),
                'valor_novo' => (string) (1 + ($index % 2)),
                'alterado_em' => now()->subDays(5 - $index),
                'origem' => 'seed',
            ]);
        }
    }
}
