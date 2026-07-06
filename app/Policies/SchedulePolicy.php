<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Schedule;

class SchedulePolicy
{
    public function create(User $user, Schedule $schedule): bool
    {
        $slot = $schedule->slot;

        // Admin e secretária podem sempre
        if ($user->role === 'admin' || $user->role === 'secretaria') {
            return true;
        }

        // Slot não trocado → equipa original
        if (!$slot->is_swapped) {
            return $user->team_id === $slot->team_id;
        }

        // Slot trocado → equipa que recebeu
        return $user->team_id === $slot->swapped_to_team_id;
    }

    public function update(User $user, Schedule $schedule): bool
    {
        // Admin pode tudo
        if ($user->role === 'admin') {
            return true;
        }

        // Secretária pode editar
        if ($user->role === 'secretaria') {
            return true;
        }

        // Membro só edita se for da equipa do slot
        return $this->create($user, $schedule);
    }

    public function delete(User $user, Schedule $schedule): bool
    {
        // Admin e secretária podem sempre
        if ($user->role === 'admin' || $user->role === 'secretaria') {
            return true;
        }

        // Líder pode cancelar agendamentos da sua equipa
        if ($user->role === 'lider') {
            return $user->team_id === $schedule->slot->team_id;
        }

        // Membro só cancela se for da equipa
        return $this->create($user, $schedule);
    }
}
