<?php

use App\Models\User;

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
