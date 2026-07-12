<?php

namespace Database\Seeders;

use App\Models\WaitingListAdmin;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Seeder;

class WaitingListAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $waitingListIds = DB::table('waiting_list')->orderBy('id')->pluck('id')->take(6);

        foreach ($waitingListIds as $index => $waitingListId) {
            WaitingListAdmin::query()->updateOrCreate(
                ['waiting_list_id' => $waitingListId],
                [
                    'contactado' => $index % 2 === 0,
                    'data_contacto' => now()->subDays($index + 1)->toDateString(),
                    'contactado_por' => $index % 2 === 0 ? 'Secretaria Cirúrgica' : null,
                    'contact_result' => $index % 2 === 0 ? 'atendeu' : 'sem resposta',
                    'observacoes' => 'Registo administrativo típico #' . ($index + 1),
                ]
            );
        }
    }
}
