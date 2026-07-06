<?php

namespace App\Policies;

use App\Models\User;
use App\Models\WaitingList;

class WaitingListPolicy
{
    public function view(User $user, WaitingList $wl): bool
    {
        // Admin e secretária veem tudo
        if ($user->role === 'admin' || $user->role === 'secretaria') {
            return true;
        }

        // Membro só vê utentes da sua equipa
        return $user->team_id === $wl->equipa_id;
    }

    public function update(User $user, WaitingList $wl): bool
    {
        // Admin e secretária podem editar
        if ($user->role === 'admin' || $user->role === 'secretaria') {
            return true;
        }

        // Líder pode atualizar dados da sua equipa
        if ($user->role === 'lider') {
            return $user->team_id === $wl->equipa_id;
        }

        // Membro não edita lista de espera
        return false;
    }
}
