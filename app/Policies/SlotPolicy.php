<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Slot;

class SlotPolicy
{
    public function schedule(User $user, Slot $slot): bool
    {
        // Admin pode tudo
        if ($user->role === 'admin') {
            return true;
        }

        // Secretária pode tudo
        if ($user->role === 'secretaria') {
            return true;
        }

        // Slot não trocado → só equipa proprietária
        if (!$slot->is_swapped) {
            return $user->team_id === $slot->team_id;
        }

        // Slot trocado → só equipa que recebeu
        return $user->team_id === $slot->swapped_to_team_id;
    }

    public function requestSwap(User $user, Slot $slot): bool
    {
        // Só membros da equipa proprietária podem pedir troca
        return $user->team_id === $slot->team_id;
    }

    public function approveSwap(User $user, Slot $slot): bool
    {
        // Só líder da equipa proprietária pode aprovar
        return $user->role === 'lider' && $user->team_id === $slot->team_id;
    }
}
