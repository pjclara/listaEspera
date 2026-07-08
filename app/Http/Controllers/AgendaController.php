<?php

namespace App\Http\Controllers;


use App\Http\Controllers\Controller;
use App\Models\Slot;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Http\Request;


class AgendaController extends Controller
{
    public function index()
    {
        $slots = Slot::with(['team', 'schedules' => function ($q) {
                $q->where('estado', '!=', 'cancelado')
                    ->with('waitingList');
            }, 'schedules.waitingList'])
            ->orderBy('data')
            ->orderBy('hora_inicio')
            ->get()
            ->groupBy(function ($slot) {
                return Carbon::parse($slot->data)->toDateString(); // NORMALIZAÇÃO
            });

        $teams = \App\Models\Team::all();

        $teamColors = [];
        $palette = [
            '#4F46E5', // Indigo
            '#059669', // Emerald
            '#D97706', // Amber
            '#DC2626', // Red
            '#2563EB', // Blue
            '#7C3AED', // Violet
            '#16A34A', // Green
            '#EA580C', // Orange
            '#DB2777', // Pink
            '#0D9488', // Teal
        ];

        foreach ($teams as $index => $team) {
            $teamColors[$team->id] = $palette[$index % count($palette)];
        }

        return Inertia::render('Agenda/Index', [
            'agenda' => $slots,
            'teamColors' => $teamColors,
        ]);
    }

    public function semana(Request $request)
    {
        $start = Carbon::parse($request->get('start', now()))->startOfWeek(Carbon::MONDAY);
        $end = $start->copy()->endOfWeek(Carbon::SUNDAY);

        $slots = Slot::with([
            'team',
            'schedules' => function ($q) {
                $q->where('estado', '!=', 'cancelado')
                    ->with('waitingList');
            }
        ])
            ->whereBetween('data', [$start->toDateString(), $end->toDateString()])
            ->orderBy('data')
            ->orderBy('hora_inicio')
            ->get()
            ->groupBy(function ($slot) {
                return Carbon::parse($slot->data)->toDateString(); // NORMALIZAÇÃO
            });

        $teams = \App\Models\Team::all();

        $teamColors = [];
        $palette = [
            '#4F46E5', // Indigo
            '#059669', // Emerald
            '#D97706', // Amber
            '#DC2626', // Red
            '#2563EB', // Blue
            '#7C3AED', // Violet
            '#16A34A', // Green
            '#EA580C', // Orange
            '#DB2777', // Pink
            '#0D9488', // Teal
        ];

        foreach ($teams as $index => $team) {
            $teamColors[$team->id] = $palette[$index % count($palette)];
        }

        return Inertia::render('Agenda/Semana', [
            'agenda' => $slots,
            'waitingLists' => \App\Models\WaitingList::whereDoesntHave('schedules', function ($q) {
                $q->whereIn('estado', ['agendado', 'confirmado']);
            })->orderBy('num_processo')->get(),
            'start' => $start->toDateString(),
            'end' => $end->toDateString(),
            'teamColors' => $teamColors,
        ]);
    }

    public function mensal(Request $request)
    {
        $month = Carbon::parse($request->get('month', now()->startOfMonth()));

        $start = $month->copy()->startOfMonth()->startOfWeek(Carbon::MONDAY);
        $end = $month->copy()->endOfMonth()->endOfWeek(Carbon::SUNDAY);

        $slots = Slot::with([
            'team',
            'schedules' => function ($q) {
                $q->where('estado', '!=', 'cancelado')
                    ->with('waitingList');
            }
        ])
            ->whereBetween('data', [$start->toDateString(), $end->toDateString()])
            ->orderBy('data')
            ->orderBy('hora_inicio')
            ->get()
            ->groupBy(function ($slot) {
                return Carbon::parse($slot->data)->toDateString(); // NORMALIZAÇÃO
            });

        $teams = \App\Models\Team::all();

        $teamColors = [];
        $palette = [
            '#4F46E5', // Indigo
            '#059669', // Emerald
            '#D97706', // Amber
            '#DC2626', // Red
            '#2563EB', // Blue
            '#7C3AED', // Violet
            '#16A34A', // Green
            '#EA580C', // Orange
            '#DB2777', // Pink
            '#0D9488', // Teal
        ];

        foreach ($teams as $index => $team) {
            $teamColors[$team->id] = $palette[$index % count($palette)];
        }

        return Inertia::render('Agenda/Mensal', [
            'agenda' => $slots,
            'waitingLists' => \App\Models\WaitingList::whereDoesntHave('schedules', function ($q) {
                $q->whereIn('estado', ['agendado', 'confirmado']);
            })->orderBy('num_processo')->get(),
            'month' => $month->toDateString(),
            'start' => $start->toDateString(),
            'end' => $end->toDateString(),
            'teamColors' => $teamColors,
        ]);
    }
}
