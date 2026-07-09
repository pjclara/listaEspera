<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WaitingListContact extends Model
{
    protected $table = 'waiting_list_contacts';

    protected $fillable = [
        'waiting_list_id',
        'data_contacto',
        'contactado_por',
        'contact_result',
        'observacoes',
    ];

    public function waitingList()
    {
        return $this->belongsTo(WaitingList::class);
    }
}
