<?php

namespace Database\Seeders;

use App\Models\User;
use Database\Seeders\TeamSeeder;
use Database\Seeders\RolesSeeder;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed Users
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'pjclara@gmail.com',
            'password' => bcrypt('password')
        ]);
        // Seed Teams
        $this->call(TeamSeeder::class);
        $this->call(RolesSeeder::class);
        $this->call(UserCasesSeeder::class);

        $admin->syncRoles(['admin']);
    }
}
