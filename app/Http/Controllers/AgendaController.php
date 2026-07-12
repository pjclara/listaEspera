<?php

namespace App\Http\Controllers;


use App\Http\Controllers\Controller;
use App\Models\Slot;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Http\Request;


class AgendaController extends Controller
{
    public function exportPdf(Request $request)
    {
        $type = $request->get('type', 'semana');
        $title = 'Agenda Semanal';

        if ($type === 'mensal') {
            $month = Carbon::parse($request->get('month', now()->startOfMonth()));
            $start = $month->copy()->startOfMonth()->startOfWeek(Carbon::MONDAY);
            $end = $month->copy()->endOfMonth()->endOfWeek(Carbon::SUNDAY);
            $title = 'Agenda Mensal';
        } else {
            $start = Carbon::parse($request->get('start', now()))->startOfWeek(Carbon::MONDAY);
            $end = $start->copy()->endOfWeek(Carbon::SUNDAY);
            $type = 'semana';
            $month = null;
        }

        $slotsByDay = Slot::with([
            'team',
            'schedules' => function ($q) {
                $q->where('estado', '!=', 'cancelado')
                    ->with('waitingList');
            },
        ])
            ->whereBetween('data', [$start->toDateString(), $end->toDateString()])
            ->orderBy('data')
            ->orderBy('hora_inicio')
            ->get()
            ->groupBy(function ($slot) {
                return Carbon::parse($slot->data)->toDateString();
            });

            dd($slotsByDay);
        $pdf = Pdf::loadView('agenda.pdf', [
            'type' => $type,
            'title' => $title,
            'month' => $month,
            'start' => $start,
            'end' => $end,
            'slotsByDay' => $slotsByDay,
            'generatedAt' => now(),
        ])->setPaper('a4', 'landscape');

        $fileName = $type === 'mensal'
            ? 'agenda_mensal_' . $month->format('Y_m') . '.pdf'
            : 'agenda_semanal_' . $start->format('Y_m_d') . '_a_' . $end->format('Y_m_d') . '.pdf';

        return $pdf->download($fileName);
    }

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
