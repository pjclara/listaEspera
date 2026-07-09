<?php

namespace Database\Seeders;

use App\Models\User;
use Database\Seeders\TeamSeeder;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed Users
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@gmail.com',
            'password' => bcrypt('password')
        ]);
        // Seed Teams
        $this->call(TeamSeeder::class);
    }
}
