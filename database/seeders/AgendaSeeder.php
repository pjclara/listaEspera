<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Seeder;

class AgendaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('agenda')->insert([
            ['created_at' => now(), 'updated_at' => now()],
            ['created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
