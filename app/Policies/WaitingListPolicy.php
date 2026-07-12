<?php

namespace App\Policies;

use App\Models\User;
use App\Models\WaitingList;

class WaitingListPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('waiting_list.view');
    }

    public function view(User $user, WaitingList $wl): bool
    {
        if (! $user->can('waiting_list.view')) {
            return false;
        }

        // Admin e secretária veem tudo
        if ($user->isAdmin() || $user->isSecretary()) {
            return true;
        }

        // Membro só vê utentes da sua equipa
        return $user->belongsToTeam($wl->equipa_id);
    }

    public function update(User $user, WaitingList $wl): bool
    {
        if (! $user->can('waiting_list.manage')) {
            return false;
        }

        // Admin e secretária podem editar
        if ($user->isAdmin() || $user->isSecretary()) {
            return true;
        }

        // Líder pode atualizar dados da sua equipa
        if ($user->isTeamLeader()) {
            return $user->belongsToTeam($wl->equipa_id);
        }

        // Membro não edita lista de espera
        return false;
    }
}
