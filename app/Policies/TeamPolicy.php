<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Team;

class TeamPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('teams.view');
    }

    public function view(User $user, Team $team): bool
    {
        if (! $user->can('teams.view')) {
            return false;
        }

        // Admin e secretária veem tudo
        if ($user->isAdmin() || $user->isSecretary()) {
            return true;
        }

        // Líder e membro só veem a sua equipa
        return $user->belongsToTeam($team->id);
    }

    public function create(User $user): bool
    {
        return $user->can('teams.manage');
    }

    public function update(User $user, Team $team): bool
    {
        if (! $user->can('teams.manage')) {
            return false;
        }

        // Admin pode tudo
        if ($user->isAdmin()) {
            return true;
        }

        // Líder pode editar a sua equipa
        return $user->isTeamLeader() && $user->belongsToTeam($team->id);
    }

    public function delete(User $user, Team $team): bool
    {
        if (! $user->can('teams.manage')) {
            return false;
        }

        return $user->isAdmin();
    }
}
