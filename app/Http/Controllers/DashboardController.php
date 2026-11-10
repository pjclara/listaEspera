<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use App\Models\WaitingList;
use App\Models\WaitingListCall;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $emEspera = WaitingList::where('estado', 'A')->count();

        $agendados = WaitingList::where('estado', 'A')
            ->where('situacao', 'Agendado')
            ->count();

        $porContactar = WaitingListCall::whereNull('resultado')->count();

        $operadosMes = WaitingList::whereNotNull('data_operado')
            ->whereMonth('data_operado', now()->month)
            ->whereYear('data_operado', now()->year)
            ->count();

        $porPrioridade = WaitingList::where('estado', 'A')
            ->whereNotNull('prioridade')
            ->select('prioridade', DB::raw('count(*) as total'))
            ->groupBy('prioridade')
            ->orderBy('prioridade')
            ->get();

        $proximosAgendamentos = Schedule::with('waitingList', 'slot.team')
            ->whereHas('slot', fn ($q) => $q->where('data', '>=', now()->toDateString()))
            ->get()
            ->sortBy(fn ($schedule) => $schedule->slot?->data)
            ->take(6)
            ->values();

        return Inertia::render('dashboard', [
            'stats' => [
                'emEspera' => $emEspera,
                'agendados' => $agendados,
                'porContactar' => $porContactar,
                'operadosMes' => $operadosMes,
            ],
            'porPrioridade' => $porPrioridade,
            'proximosAgendamentos' => $proximosAgendamentos,
        ]);
    }
}
