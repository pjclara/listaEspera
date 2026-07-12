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
    public function index(Request $request)
    {
        $this->authorize('viewAny', Team::class);

        $user = $request->user();

        $teamsQuery = Team::with(['leader', 'users'])->orderBy('nome');

        if (! $user->isAdmin() && ! $user->isSecretary()) {
            $teamsQuery->where('id', $user->team_id);
        }

        $usersQuery = User::query()->orderBy('name');

        if (! $user->isAdmin() && ! $user->isSecretary()) {
            $usersQuery->where('team_id', $user->team_id);
        }

        return Inertia::render('Teams/Index', [
            'teams' => $teamsQuery->get(),
            'users' => $usersQuery->get(),
        ]);
    }

    /**
     * Criar nova equipa
     */
    public function store(Request $request)
    {
        $this->authorize('create', Team::class);

        $data = $request->validate([
            'nome' => 'required|string|max:255',
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
        $this->authorize('update', $team);

        $data = $request->validate([
            'nome' => 'required|string|max:255',
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
        $this->authorize('delete', $team);

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
        $this->authorize('update', $team);

        $data = $request->validate([
            'users' => 'array',
            'users.*' => 'exists:users,id',
        ]);

        $selectedUsers = $data['users'] ?? [];

        // Remove utilizadores não selecionados desta equipa
        User::query()->where('team_id', $team->id)
            ->whereNotIn('id', $selectedUsers)
            ->update(['team_id' => null]);

        // Atribui equipa aos utilizadores selecionados
        User::query()->whereIn('id', $selectedUsers)->update(['team_id' => $team->id]);

        return back()->with('toast', [
            'type' => 'success',
            'title' => 'Membros atualizados',
            'description' => 'Os membros da equipa foram atualizados.',
        ]);
    }
}
