<?php

namespace Database\Seeders;

use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserCasesSeeder extends Seeder
{
    public function run(): void
    {
        $teams = Team::query()->orderBy('id', 'asc')->get();

        $teamA = $teams->get(0);
        $teamB = $teams->get(1);

        // Casos típicos globais
        $secretaria = User::query()->firstOrCreate(
            ['email' => 'secretaria@cirurgia.local'],
            [
                'name' => 'Secretaria Cirúrgica',
                'password' => bcrypt('password'),
                'role' => 'secretaria',
            ]
        );
        $secretaria->syncRoles(['secretaria']);

        // Casos típicos por equipa
        if ($teamA) {
            $leaderA = User::query()->firstOrCreate(
                ['email' => 'lider.' . $teamA->id . '@cirurgia.local'],
                [
                    'name' => 'Líder ' . $teamA->nome,
                    'password' => bcrypt('password'),
                    'team_id' => $teamA->id,
                    'role' => 'lider',
                ]
            );
            $leaderA->update(['team_id' => $teamA->id, 'role' => 'lider']);
            $leaderA->syncRoles(['team_leader']);

            $memberA = User::query()->firstOrCreate(
                ['email' => 'membro.' . $teamA->id . '@cirurgia.local'],
                [
                    'name' => 'Membro ' . $teamA->nome,
                    'password' => bcrypt('password'),
                    'team_id' => $teamA->id,
                    'role' => 'membro',
                ]
            );
            $memberA->update(['team_id' => $teamA->id, 'role' => 'membro']);
            $memberA->syncRoles(['team_member']);

            $teamA->update(['leader_id' => $leaderA->id]);
        }

        if ($teamB) {
            $leaderB = User::query()->firstOrCreate(
                ['email' => 'lider.' . $teamB->id . '@cirurgia.local'],
                [
                    'name' => 'Líder ' . $teamB->nome,
                    'password' => bcrypt('password'),
                    'team_id' => $teamB->id,
                    'role' => 'lider',
                ]
            );
            $leaderB->update(['team_id' => $teamB->id, 'role' => 'lider']);
            $leaderB->syncRoles(['team_leader']);

            $memberB = User::query()->firstOrCreate(
                ['email' => 'membro.' . $teamB->id . '@cirurgia.local'],
                [
                    'name' => 'Membro ' . $teamB->nome,
                    'password' => bcrypt('password'),
                    'team_id' => $teamB->id,
                    'role' => 'membro',
                ]
            );
            $memberB->update(['team_id' => $teamB->id, 'role' => 'membro']);
            $memberB->syncRoles(['team_member']);

            $teamB->update(['leader_id' => $leaderB->id]);
        }
    }
}
