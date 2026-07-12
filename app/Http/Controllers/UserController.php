<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index()
    {
        return Inertia::render('Users/Index', [
            'users' => User::with('roles')->paginate(10),
            'roles' => Role::all(),
            'teams' => Team::query()->orderBy('nome')->get(['id', 'nome']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Users/Create', [
            'roles' => Role::all(),
            'teams' => Team::query()->orderBy('nome')->get(['id', 'nome']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'role'     => 'required|string|exists:roles,name',
            'team_id'  => 'nullable|exists:teams,id',
        ]);

        if (in_array($data['role'], ['team_member', 'team_leader', 'membro', 'lider'], true) && empty($data['team_id'])) {
            return back()->withErrors([
                'team_id' => 'Utilizadores de equipa precisam de equipa associada.',
            ])->withInput();
        }

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => bcrypt($data['password']),
            'team_id'  => $data['team_id'] ?? null,
        ]);

        $user->assignRole($data['role']);

        if (in_array($data['role'], ['team_leader', 'lider'], true) && ! empty($data['team_id'])) {
            Team::whereKey($data['team_id'])->update(['leader_id' => $user->id]);
        }

        return redirect()->route('users.index');
    }

    public function edit(User $user)
    {
        return Inertia::render('Users/Edit', [
            'user'  => $user->load('roles'),
            'roles' => Role::all(),
            'teams' => Team::query()->orderBy('nome')->get(['id', 'nome']),
        ]);
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'role'  => 'required|string|exists:roles,name',
            'team_id' => 'nullable|exists:teams,id',
        ]);

        if (in_array($data['role'], ['team_member', 'team_leader', 'membro', 'lider'], true) && empty($data['team_id'])) {
            return back()->withErrors([
                'team_id' => 'Utilizadores de equipa precisam de equipa associada.',
            ])->withInput();
        }

        $user->update($data);

        $user->syncRoles([$data['role']]);

        if (in_array($data['role'], ['team_leader', 'lider'], true) && ! empty($data['team_id'])) {
            Team::whereKey($data['team_id'])->update(['leader_id' => $user->id]);
        }

        return redirect()->route('users.index');
    }

    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->route('users.index');
    }

    // show
    public function show(User $user)
    {
        return Inertia::render('Users/Show', [
            'user' => $user->load('roles', 'team'),
        ]);
    }
}
