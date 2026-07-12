<?php

namespace Database\Seeders;

use App\Models\Slot;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Seeder;

class SlotSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $teams = Team::query()->orderBy('id', 'asc')->get();

        if ($teams->isEmpty()) {
            return;
        }

        foreach ($teams as $index => $team) {
            Slot::query()->updateOrCreate(
                [
                    'team_id' => $team->id,
                    'data' => now()->addDays($index + 1)->toDateString(),
                    'hora_inicio' => '08:00:00',
                ],
                [
                    'sala' => 'Sala ' . (($index % 4) + 1),
                    'hora_fim' => '12:00:00',
                    'tipo' => $index % 2 === 0 ? 'programado' : 'ambulatorio',
                ]
            );
        }

        if ($teams->count() >= 2) {
            $owner = $teams[0];
            $receiver = $teams[1];
            $requester = User::query()->where('team_id', $owner->id)->first();
            $approver = User::query()->where('team_id', $owner->id)->where('role', 'lider')->first();

            Slot::query()->updateOrCreate(
                [
                    'team_id' => $owner->id,
                    'data' => now()->addDays(15)->toDateString(),
                    'hora_inicio' => '14:00:00',
                ],
                [
                    'sala' => 'Sala 5',
                    'hora_fim' => '18:00:00',
                    'tipo' => 'programado',
                    'is_swapped' => true,
                    'swapped_to_team_id' => $receiver->id,
                    'swap_requested_by' => $requester?->id,
                    'swap_approved_by' => $approver?->id,
                    'swap_reason' => 'Troca típica entre equipas por indisponibilidade.',
                ]
            );
        }
    }
}
