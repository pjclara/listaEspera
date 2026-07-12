<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Schedule;

class SchedulePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('schedules.view');
    }

    public function create(User $user, Schedule $schedule): bool
    {
        if (! $user->can('schedules.create')) {
            return false;
        }

        $slot = $schedule->slot;

        // Admin e secretária podem sempre
        if ($user->isAdmin() || $user->isSecretary()) {
            return true;
        }

        // Slot não trocado → equipa original
        if (!$slot->is_swapped) {
            return $user->belongsToTeam($slot->team_id);
        }

        // Slot trocado → equipa que recebeu
        return $user->belongsToTeam($slot->swapped_to_team_id);
    }

    public function update(User $user, Schedule $schedule): bool
    {
        if (! $user->can('schedules.edit')) {
            return false;
        }

        // Admin pode tudo
        if ($user->isAdmin()) {
            return true;
        }

        // Secretária pode editar
        if ($user->isSecretary()) {
            return true;
        }

        // Membro só edita se for da equipa do slot
        return $this->create($user, $schedule);
    }

    public function delete(User $user, Schedule $schedule): bool
    {
        if (! $user->can('schedules.delete')) {
            return false;
        }

        // Admin e secretária podem sempre
        if ($user->isAdmin() || $user->isSecretary()) {
            return true;
        }

        // Líder pode cancelar agendamentos da sua equipa
        if ($user->isTeamLeader()) {
            return $user->belongsToTeam($schedule->slot->team_id);
        }

        // Membro só cancela se for da equipa
        return $this->create($user, $schedule);
    }
}
