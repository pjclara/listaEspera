<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WaitingList extends Model
{
    protected $table = 'waiting_list';

    protected $fillable = [
        'id',
        'data_marcacao',
        'prioridade',
        'regime',
        'situacao',
        'estado',
        'data_operado',
        'data_agenda',
        'num_processo',
        'sexo',
        'des_grupo',
        'cod_medico',
        'nome_clinico',
        'patologia',
        'des_diagnostico',
        'interv_cirurgica',
        'data_cancel',
        'cancel',
        'des_cancel',
        'equipa_id',
        'updated_from_excel_at',
        'observacoes_gerais',
    ];

    public $incrementing = false; // porque o ID vem do Excel

    protected $casts = [
        'data_marcacao' => 'date',
        'data_operado' => 'date',
        'data_agenda' => 'date',
        'data_cancel' => 'date',
        'updated_from_excel_at' => 'datetime',
    ];

    public function history()
    {
        return $this->hasMany(WaitingListHistory::class);
    }

    public function admin()
    {
        return $this->hasOne(WaitingListAdmin::class);
    }

    public function contacts()
    {
        return $this->hasMany(WaitingListContact::class);
    }

    public function team()
    {
        return $this->belongsTo(Team::class, 'equipa_id');
    }

    public function schedule()
    {
        return $this->hasOne(Schedule::class);
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }
}
