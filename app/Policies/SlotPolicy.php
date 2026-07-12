<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Slot;

class SlotPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('slots.view');
    }

    public function create(User $user): bool
    {
        return $user->can('slots.create');
    }

    public function update(User $user, Slot $slot): bool
    {
        if (! $user->can('slots.edit')) {
            return false;
        }

        if ($user->isAdmin() || $user->isSecretary()) {
            return true;
        }

        return $user->belongsToTeam($slot->team_id);
    }

    public function delete(User $user, Slot $slot): bool
    {
        if (! $user->can('slots.delete')) {
            return false;
        }

        if ($user->isAdmin() || $user->isSecretary()) {
            return true;
        }

        return $user->isTeamLeader() && $user->belongsToTeam($slot->team_id);
    }

    public function schedule(User $user, Slot $slot): bool
    {
        if (! $user->can('schedules.create')) {
            return false;
        }

        // Admin pode tudo
        if ($user->isAdmin()) {
            return true;
        }

        // Secretária pode tudo
        if ($user->isSecretary()) {
            return true;
        }

        // Slot não trocado → só equipa proprietária
        if (!$slot->is_swapped) {
            return $user->belongsToTeam($slot->team_id);
        }

        // Slot trocado → só equipa que recebeu
        return $user->belongsToTeam($slot->swapped_to_team_id);
    }

    public function requestSwap(User $user, Slot $slot): bool
    {
        if (! $user->can('schedules.move')) {
            return false;
        }

        // Só membros da equipa proprietária podem pedir troca
        return $user->belongsToTeam($slot->team_id);
    }

    public function approveSwap(User $user, Slot $slot): bool
    {
        if (! $user->can('schedules.move')) {
            return false;
        }

        // Só líder da equipa proprietária pode aprovar
        return $user->isTeamLeader() && $user->belongsToTeam($slot->team_id);
    }
}
