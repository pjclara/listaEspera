<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Slot;
use App\Models\Team;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SlotController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Slot::class);

        $user = $request->user();

        $slotsQuery = Slot::with('team')->orderBy('data');

        if (! $user->isAdmin() && ! $user->isSecretary()) {
            $slotsQuery->where(function ($query) use ($user) {
                $query->where('team_id', $user->team_id)
                    ->orWhere('swapped_to_team_id', $user->team_id);
            });
        }

        $teamsQuery = Team::query();

        if (! $user->isAdmin() && ! $user->isSecretary()) {
            $teamsQuery->where('id', $user->team_id);
        }

        return Inertia::render('Slots/Index', [
            'slots' => $slotsQuery->get(),
            'teams' => $teamsQuery->get(),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Slot::class);

        $data = $request->validate([
            'data' => 'required|date',
            'hora_inicio' => 'required',
            'hora_fim' => 'required',
            'team_id' => 'required|exists:teams,id',
            'sala' => 'nullable|string',

            // repetição
            'repeat_type' => 'required|in:none,daily,weekly,monthly',
            'repeat_until' => 'nullable|date',
        ]);

        // criar slot principal
        $slot = Slot::create($data);

        // se não repetir → acabou
        if ($data['repeat_type'] === 'none') {
            return back()->with('success', 'Slot criado.');
        }

        // gerar repetição
        $date = Carbon::parse($data['data']);
        $created = 1;

        $date = Carbon::parse($data['data']);

        while (true) {

        if ($data['repeat_type'] === 'daily') {
                $date->addDay();
            } elseif ($data['repeat_type'] === 'weekly') {
                $date->addWeek();
            } elseif ($data['repeat_type'] === 'monthly') {
                $date->addMonth();
            }

            // parar quando ultrapassar o limite
            if ($date->gt($data['repeat_until'])) {
                break;
            }

            // criar slot repetido
            Slot::create([
                ...$data,
                'data' => $date->format('Y-m-d'),
            ]);
        }

        return back()->with('success', 'Slots criados com repetição.');
    }


    public function update(Request $request, Slot $slot)
    {
        $this->authorize('update', $slot);

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
        $this->authorize('delete', $slot);

        $slot->delete();

        return back()->with('success', 'Slot removido.');
    }
}
