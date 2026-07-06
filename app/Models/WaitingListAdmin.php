<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WaitingListAdmin extends Model
{
    protected $table = 'waiting_list_admin';

    protected $fillable = [
        'waiting_list_id',
        'contactado',
        'data_contacto',
        'contactado_por',
        'observacoes',
    ];

    protected $casts = [
        'contactado' => 'boolean',
        'data_contacto' => 'date',
    ];

    public function waitingList()
    {
        return $this->belongsTo(WaitingList::class);
    }
}
