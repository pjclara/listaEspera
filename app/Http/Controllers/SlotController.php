<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Slot;
use App\Models\Team;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SlotController extends Controller
{
    public function index()
    {
        return Inertia::render('Slots/Index', [
            'slots' => Slot::with('team')->orderBy('data')->get(),
            'equipas' => Team::all(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'data' => 'required|date',
            'hora_inicio' => 'required',
            'hora_fim' => 'required',
            'team_id' => 'required|exists:teams,id',
            'sala' => 'nullable|string',
            'observacoes' => 'nullable|string',
        ]);

        Slot::create($data);

        return back()->with('success', 'Slot criado com sucesso.');
    }

    public function update(Request $request, Slot $slot)
    {
        $data = $request->validate([
            'data' => 'required|date',
            'hora_inicio' => 'required',
            'hora_fim' => 'required',
            'team_id' => 'required|exists:teams,id',
            'sala' => 'nullable|string',
            'observacoes' => 'nullable|string',
        ]);

        $slot->update($data);

        return back()->with('success', 'Slot atualizado com sucesso.');
    }

    public function destroy(Slot $slot)
    {
        $slot->delete();

        return back()->with('success', 'Slot removido.');
    }
}
