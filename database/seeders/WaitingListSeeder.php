<?php

namespace Database\Seeders;

use App\Models\Team;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class WaitingListSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $teams = Team::query()->orderBy('id', 'asc')->get(['id']);

        if ($teams->isEmpty()) {
            return;
        }

        $baseDate = now()->subDays(40);

        $rows = collect(range(1, 12))->map(function (int $index) use ($teams, $baseDate) {
            $team = $teams[$index % $teams->count()];

            return [
                'id' => 1000 + $index,
                'data_marcacao' => $baseDate->copy()->addDays($index)->toDateString(),
                'prioridade' => ($index % 3) + 1,
                'regime' => $index % 2 === 0 ? 'Internamento' : 'Ambulatório',
                'situacao' => $index % 4 === 0 ? 'Pre-Inscrito' : 'Inscrito',
                'estado' => $index % 5 === 0 ? 'A1' : 'A',
                'data_operado' => null,
                'data_agenda' => null,
                'num_processo' => 'PROC' . str_pad((string) $index, 5, '0', STR_PAD_LEFT),
                'sexo' => $index % 2 === 0 ? 'F' : 'M',
                'des_grupo' => 'HSA - CIRURGIA',
                'cod_medico' => 500 + $index,
                'nome_clinico' => 'Médico ' . $index,
                'patologia' => 'P' . (($index % 4) + 1) . ' - Patologia Tipo ' . (($index % 4) + 1),
                'des_diagnostico' => 'Diagnóstico de exemplo ' . $index,
                'interv_cirurgica' => 'Intervenção tipo ' . (($index % 5) + 1),
                'data_cancel' => null,
                'cancel' => null,
                'des_cancel' => null,
                'team_id' => $team->id,
                'updated_from_excel_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        });

        DB::table('waiting_list')->upsert($rows->toArray(), ['id']);
    }
}
