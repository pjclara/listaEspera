<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TeamSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Adicionar equipas de exemplo
        $teams = [
            ['nome' => 'Colorectal'],
            ['nome' => 'Hepatobiliopancreática'],
            ['nome' => 'Parede abdominal e mama'],
            ['nome' => 'EsofagoGastrica'],
            ['nome' => 'Endocrina'],
            ['nome' => 'Cirurgia Geral'],

        ];

        foreach ($teams as $team) {
            \App\Models\Team::create($team);
        }
    }
}