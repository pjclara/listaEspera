<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Slot extends Model
{
    protected $fillable = [
        'team_id',
        'sala',
        'data',
        'hora_inicio',
        'hora_fim',
        'tipo',
        'is_swapped',
        'swapped_to_team_id',
        'swap_requested_by',
        'swap_approved_by',
        'swap_reason',
    ];

    protected $casts = [
        'data' => 'date',
        'hora_inicio' => 'datetime:H:i',
        'hora_fim' => 'datetime:H:i',
        'is_swapped' => 'boolean',
    ];

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function swappedToTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'swapped_to_team_id');
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'swap_requested_by');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'swap_approved_by');
    }
}
