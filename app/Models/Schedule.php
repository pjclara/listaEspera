<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Schedule extends Model
{
    protected $fillable = [
        'slot_id',
        'waiting_list_id',
        'user_id',
        'estado',
        'duracao_estimada',
    ];

    // set the default user_id to the currently authenticated user when creating a new Schedule
    protected static function booted()
    {
        static::creating(function ($schedule) {
            if (auth()->check()) {
                $schedule->user_id = auth()->id();
            }
        });
    }

    public function slot(): BelongsTo
    {
        return $this->belongsTo(Slot::class);
    }

    public function waitingList(): BelongsTo
    {
        return $this->belongsTo(WaitingList::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
