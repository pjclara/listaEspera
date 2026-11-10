<?php

use App\Models\User;
use App\Models\WaitingList;

test('dashboard carrega estatísticas reais', function () {
    $this->actingAs(User::factory()->create());

    $response = $this->get('/dashboard');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->has('stats.emEspera')
        ->has('stats.agendados')
        ->has('stats.porContactar')
        ->has('stats.operadosMes')
        ->has('porPrioridade')
        ->has('proximosAgendamentos')
    );
});

test('dashboard não rebenta quando há registos com prioridade por agregar', function () {
    $this->actingAs(User::factory()->create());

    WaitingList::create([
        'id' => 1,
        'num_processo' => 'A1',
        'estado' => 'A',
        'situacao' => 'Inscrito',
        'prioridade' => 1,
    ]);

    $response = $this->get('/dashboard');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->has('porPrioridade', 1)
    );
});
