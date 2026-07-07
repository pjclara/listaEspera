<?php

namespace App\Http\Controllers;


use App\Models\Slot;
use Inertia\Inertia;

class AgendaController extends Controller
{
    public function index()
    {
        $slots = Slot::with(['team', 'schedules', 'schedules.waitingList'])
            ->orderBy('data')
            ->orderBy('hora_inicio')
            ->get()
            ->groupBy('data');

        return Inertia::render('Agenda/Index', [
            'agenda' => $slots,
        ]);
    }


}
