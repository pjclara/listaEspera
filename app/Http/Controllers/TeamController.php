<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeamController extends Controller
{
    /**
     * Página principal de gestão de equipas
     */
    public function index()
    {
        return Inertia::render('Teams/Index', [
            'teams' => Team::with(['leader', 'users'])->orderBy('nome')->get(),
            'users' => User::orderBy('name')->get(),
        ]);
    }

    /**
     * Criar nova equipa
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'nome' => 'required|string|max:255',
            'especialidade' => 'nullable|string|max:255',
            'cor' => 'required|string|max:20',
            'sala_default' => 'nullable|string|max:255',
            'ativa' => 'required|boolean',
            'leader_id' => 'nullable|exists:users,id',
        ]);

        Team::create($data);

        return back()->with('toast', [
            'type' => 'success',
            'title' => 'Equipa criada',
            'description' => 'A equipa foi criada com sucesso.',
        ]);
    }

    /**
     * Atualizar equipa
     */
    public function update(Request $request, Team $team)
    {
        $data = $request->validate([
            'nome' => 'required|string|max:255',
            'especialidade' => 'nullable|string|max:255',
            'cor' => 'required|string|max:20',
            'sala_default' => 'nullable|string|max:255',
            'ativa' => 'required|boolean',
            'leader_id' => 'nullable|exists:users,id',
        ]);

        $team->update($data);

        return back()->with('toast', [
            'type' => 'success',
            'title' => 'Equipa atualizada',
            'description' => 'As alterações foram guardadas.',
        ]);
    }

    /**
     * Apagar equipa
     */
    public function destroy(Team $team)
    {
        $team->delete();

        return back()->with('toast', [
            'type' => 'success',
            'title' => 'Equipa removida',
            'description' => 'A equipa foi apagada.',
        ]);
    }

    /**
     * Atualizar membros da equipa (pivot team_user)
     */
    public function updateMembers(Request $request, Team $team)
    {
        $data = $request->validate([
            'users' => 'array',
            'users.*' => 'exists:users,id',
        ]);

        $team->users()->sync($data['users']);

        return back()->with('toast', [
            'type' => 'success',
            'title' => 'Membros atualizados',
            'description' => 'Os membros da equipa foram atualizados.',
        ]);
    }
}
