<?php

use App\Models\Team;
use App\Models\User;
use App\Models\WaitingList;
use Database\Seeders\RolesSeeder;

beforeEach(function () {
    $this->seed(RolesSeeder::class);
});

test('admin consegue filtrar a lista de espera por nome do médico', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $this->actingAs($admin);

    WaitingList::create([
        'id' => 1,
        'num_processo' => 'A1',
        'situacao' => 'Inscrito',
        'estado' => 'A',
        'nome_clinico' => 'Dr. João Silva',
    ]);

    WaitingList::create([
        'id' => 2,
        'num_processo' => 'A2',
        'situacao' => 'Inscrito',
        'estado' => 'A',
        'nome_clinico' => 'Dra. Maria Costa',
    ]);

    $response = $this->get('/waiting-lists?medico_nome=João');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->has('waitingLists.data', 1)
        ->where('waitingLists.data.0.id', 1)
    );
});
