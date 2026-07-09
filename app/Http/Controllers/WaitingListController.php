<?php

namespace App\Http\Controllers;

use App\Exports\WaitingListExport;
use App\Models\Schedule;
use App\Models\Team;
use App\Models\WaitingList;
use App\Models\WaitingListContact;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class WaitingListController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if (!$request->estado) {
            $request->merge(['estado' => 'A']);
        }
        if (!$request->situacao) {
            $request->merge(['situacao' => ['Readmitido', 'Inscrito', 'Pre-Inscrito', 'Transferido para']]);
        }
        $waitingLists = WaitingList::with('admin', 'schedule', 'contacts')
            ->when($request->num_processo, fn($q) => $q->where('num_processo', $request->num_processo))
            ->when($request->situacao, fn($q) => $q->whereIn('situacao', (array) $request->situacao))
            ->when($request->estado, fn($q) => $q->where('estado', $request->estado))
            // des_diagnostico
            ->when($request->des_diagnostico, fn($q) => $q->where('des_diagnostico', 'like', '%' . $request->des_diagnostico . '%'))
            ->orderBy('data_marcacao', 'asc')
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
                'des_diagnostico' => $request->des_diagnostico,
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
            'contactado'      => 'boolean',
            'data_contacto'   => 'required|date',
            'contactado_por'  => 'required|string|max:255',
            'contact_result'  => 'required|string',
            'observacoes'     => 'nullable|string',
        ]);

        // Guardar histórico
        WaitingListContact::create([
            'waiting_list_id' => $waitingList->id,
            'data_contacto'   => $data['data_contacto'],
            'contactado_por'  => $data['contactado_por'],
            'contact_result'  => $data['contact_result'],
            'observacoes'     => $data['observacoes'],
        ]);

        // Atualizar estado atual
        $waitingList->admin()->update($data);

        return back()->with('toast', [
            'type' => 'success',
            'title' => 'Contacto registado',
            'description' => 'O contacto foi guardado com sucesso.',
        ]);
    }

    public function storeSchedule(Request $request, WaitingList $waitingList)
    {
        $data = $request->validate([
            'slot_id' => 'required|exists:slots,id',
            'duracao_estimada' => 'nullable|integer|min:1',
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
            'duracao_estimada' => 'nullable|integer|min:1',
            'estado' => 'required|string',
        ]);

        $schedule->update($data);
    }


    public function export(Request $request)
    {

        $query = WaitingList::query();

        if ($request->num_processo) {
            $query->where('num_processo', $request->num_processo);
        }

        if ($request->des_diagnostico) {
            $query->where('des_diagnostico', 'like', "%{$request->des_diagnostico}%");
        }

        if ($request->situacao) {
            $query->whereIn('situacao', (array) $request->situacao);
        }

        if ($request->estado) {
            $query->where('estado', $request->estado);
        }

        $data = $query->get();

        return Excel::download(new WaitingListExport($data), 'lista_espera.xlsx');
    }
}
