<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Team;

class TeamPolicy
{
    public function view(User $user, Team $team): bool
    {
        // Admin e secretária veem tudo
        if ($user->role === 'admin' || $user->role === 'secretaria') {
            return true;
        }

        // Membro só vê a sua equipa
        return $user->team_id === $team->id;
    }

    public function update(User $user, Team $team): bool
    {
        // Admin pode tudo
        if ($user->role === 'admin') {
            return true;
        }

        // Líder pode editar a sua equipa
        return $user->role === 'lider' && $user->team_id === $team->id;
    }
}
