<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WaitingList extends Model
{
    protected $table = 'waiting_list';

    protected $fillable = [
        'id',
        'data_inscricao',
        'prioridade',
        'origem',
        'estado',
        'sexo',
        'episodio_id',
        'instituicao',
        'medico_id',
        'medico_nome',
        'diagnostico_cid',
        'diagnostico_desc',
        'procedimento_pcs',
        'data_prevista',
        'duracao_estimada',
        'motivo_cancelamento',
        'equipa_id',
        'updated_from_excel_at',
    ];

    protected $casts = [
        'data_inscricao' => 'date',
        'data_prevista' => 'date',
        'updated_from_excel_at' => 'datetime',
    ];

    public $incrementing = false; // ID vem do Excel

    public function equipa(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'equipa_id');
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }

    public function history(): HasMany
    {
        return $this->hasMany(WaitingListHistory::class);
    }
}
