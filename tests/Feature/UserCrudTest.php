<?php

use App\Models\User;
use Database\Seeders\RolesSeeder;

beforeEach(function () {
    $this->seed(RolesSeeder::class);
});

function actingAsAdmin(): User
{
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    test()->actingAs($admin);

    return $admin;
}

test('admin can view create user page', function () {
    actingAsAdmin();

    $this->get('/users/create')->assertOk();
});

test('admin can create a user', function () {
    actingAsAdmin();

    $response = $this->post('/users', [
        'name' => 'Novo Utilizador',
        'email' => 'novo@example.com',
        'password' => 'password123',
        'role' => 'secretaria',
    ]);

    $response->assertRedirect('/users');
    $this->assertDatabaseHas('users', ['email' => 'novo@example.com']);

    $user = User::where('email', 'novo@example.com')->first();
    expect($user->hasRole('secretaria'))->toBeTrue();
});

test('admin can edit a user', function () {
    actingAsAdmin();

    $user = User::factory()->create();
    $user->assignRole('secretaria');

    $response = $this->put("/users/{$user->id}", [
        'name' => 'Nome Alterado',
        'email' => $user->email,
        'role' => 'secretaria',
    ]);

    $response->assertRedirect('/users');
    $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'Nome Alterado']);
});

test('admin can delete a user', function () {
    actingAsAdmin();

    $user = User::factory()->create();
    $user->assignRole('secretaria');

    $response = $this->delete("/users/{$user->id}");

    $response->assertRedirect('/users');
    $this->assertDatabaseMissing('users', ['id' => $user->id]);
});

test('admin cannot delete own account', function () {
    $admin = actingAsAdmin();

    $response = $this->delete("/users/{$admin->id}");

    $response->assertSessionHasErrors('user');
    $this->assertDatabaseHas('users', ['id' => $admin->id]);
});
