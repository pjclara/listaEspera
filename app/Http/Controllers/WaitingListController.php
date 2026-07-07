<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use App\Models\Team;
use App\Models\WaitingList;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WaitingListController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $waitingLists = WaitingList::with('admin', 'schedule')
            ->when($request->num_processo, fn($q) => $q->where('num_processo', $request->num_processo))
            ->when($request->situacao, fn($q) => $q->where('situacao', $request->situacao))
            ->when($request->estado, fn($q) => $q->where('estado', $request->estado))
            ->paginate(20)
            ->withQueryString();

        // get distinct situacao values for the filter dropdown
        $situacaoOptions = WaitingList::query()
            ->select('situacao')
            ->distinct()
            ->pluck('situacao');

        // get distinct estado values for the filter dropdown
        $estadoOptions = WaitingList::query()
            ->select('estado')
            ->distinct()
            ->pluck('estado');

        $equipaOptions = Team::query()
            ->select('id', 'nome')
            ->get();

        $slotsDisponiveis = \App\Models\Slot::query()
            ->where('data', '>=', now())
            ->where('is_swapped', false)
            ->with('team')
            ->get();

        return Inertia::render('WaitingList/Index', [
            'waitingLists' => $waitingLists,
            'situacaoOptions' => $situacaoOptions,
            'estadoOptions' => $estadoOptions,
            'equipaOptions' => $equipaOptions,
            'slotsDisponiveis' => $slotsDisponiveis,
            'filters' => [
                'num_processo' => $request->num_processo,
                'situacao' => $request->situacao,
                'estado' => $request->estado,
            ],
        ]);
    }


    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(WaitingList $waitingList)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(WaitingList $waitingList)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, WaitingList $waitingList)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(WaitingList $waitingList)
    {
        //
    }

    public function updateAdmin(Request $request, WaitingList $waitingList)
    {
        $data = $request->validate([
            'contactado' => 'boolean',
            'data_contacto' => 'required_if:contactado,true|date',
            'contactado_por' => 'required_if:contactado,true|string|max:255',
            'observacoes' => 'nullable|string',
        ]);

        $waitingList->admin()->updateOrCreate(
            ['waiting_list_id' => $waitingList->id],
            $data
        );

        return back()->with('success', 'Dados administrativos atualizados.');
    }

    public function storeSchedule(Request $request, WaitingList $waitingList)
    {
        $data = $request->validate([
            'slot_id' => 'required|exists:slots,id',
            'duracao_estimada' => 'required|integer|min:1',
            'estado' => 'required|string',
        ]);

        Schedule::create([
            'waiting_list_id' => $waitingList->id,
            'slot_id' => $data['slot_id'],
            'user_id' => auth()->id(),
            'estado' => $data['estado'],
            'duracao_estimada' => $data['duracao_estimada'],
        ]);
    }

    public function updateSchedule(Request $request, WaitingList $waitingList, Schedule $schedule)
    {
        $data = $request->validate([
            'slot_id' => 'required|exists:slots,id',
            'duracao_estimada' => 'required|integer|min:1',
            'estado' => 'required|string',
        ]);

        $schedule->update($data);
    }
}
