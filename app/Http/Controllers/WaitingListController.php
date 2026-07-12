<?php

namespace App\Http\Controllers;

use App\Exports\WaitingListExport;
use App\Models\Schedule;
use App\Models\Team;
use App\Models\WaitingList;
use App\Models\WaitingListContact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class WaitingListController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', WaitingList::class);

        if (!$request->estado) {
            $request->merge(['estado' => 'A']);
        }
        if (!$request->situacao) {
            $request->merge(['situacao' => ['Readmitido', 'Inscrito', 'Pre-Inscrito', 'Transferido Para']]);
        }
        $user = $request->user();

        $waitingLists = WaitingList::with('admin', 'schedule', 'contacts')
            ->when($request->num_processo, fn($q) => $q->where('num_processo', $request->num_processo))
            ->when($request->situacao, fn($q) => $q->whereIn('situacao', (array) $request->situacao))
            ->when($request->estado, fn($q) => $q->where('estado', $request->estado))
            ->when($request->prioridade, fn($q) => $q->where('prioridade', $request->prioridade))
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
            ->when(! $user->isAdmin() && ! $user->isSecretary(), fn($q) => $q->where('id', $user->team_id))
            ->select('id', 'nome')
            ->get();

        $slotsDisponiveis = \App\Models\Slot::query()
            ->where('data', '>=', now())
            ->where('is_swapped', false)
            ->when(! $user->isAdmin() && ! $user->isSecretary(), fn($q) => $q->where('team_id', $user->team_id))
            ->with('team')
            ->get();

        $prioridadeOptionsState = WaitingList::query()
            ->select('prioridade')
            ->distinct()
            ->pluck('prioridade');

        return Inertia::render('WaitingList/Index', [
            'waitingLists' => $waitingLists,
            'situacaoOptions' => $situacaoOptions,
            'estadoOptions' => $estadoOptions,
            'equipaOptions' => $equipaOptions,
            'slotsDisponiveis' => $slotsDisponiveis,
            'prioridadeOptionsState' => $prioridadeOptionsState,
            // users permissions
            'permissions' => $request->user()->getAllPermissions()->pluck('name')->toArray(),
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
        $this->authorize('update', $waitingList);

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
        $this->authorize('update', $waitingList);

        $data = $request->validate([
            'slot_id' => 'required|exists:slots,id',
            'duracao_estimada' => 'nullable|integer|min:1',
            'estado' => 'required|string',
            'pernoita' => 'required|string|in:sim,nao,talvez',
        ]);

        $slot = \App\Models\Slot::findOrFail($data['slot_id']);

        if (! $request->user()->can('schedule', $slot)) {
            abort(403);
        }

        Schedule::create([
            'waiting_list_id' => $waitingList->id,
            'slot_id' => $data['slot_id'],
            'user_id' => Auth::id(),
            'estado' => $data['estado'],
            'duracao_estimada' => $data['duracao_estimada'],
            'pernoita' => $data['pernoita'],
        ]);

        return back()->with('toast', [
            'type' => 'success',
            'title' => 'Agendamento criado',
            'description' => 'O agendamento foi registado com sucesso.',
        ]);
    }

    public function updateSchedule(Request $request, WaitingList $waitingList, Schedule $schedule)
    {
        $this->authorize('update', $waitingList);

        $data = $request->validate([
            'slot_id' => 'required|exists:slots,id',
            'duracao_estimada' => 'nullable|integer|min:1',
            'estado' => 'required|string',
            'pernoita' => 'required|string|in:sim,nao,talvez',
        ]);

        $slot = \App\Models\Slot::findOrFail($data['slot_id']);

        if (! $request->user()->can('schedule', $slot) || ! $request->user()->can('schedules.edit')) {
            abort(403);
        }

        $schedule->update($data);

        return back()->with('toast', [
            'type' => 'success',
            'title' => 'Agendamento atualizado',
            'description' => 'As alterações ao agendamento foram guardadas.',
        ]);
    }


    public function export(Request $request)
    {
        abort_unless($request->user()->can('waiting_list.export'), 403);

        $query = WaitingList::query();

        if (! $request->user()->isAdmin() && ! $request->user()->isSecretary()) {
            $query->where('equipa_id', $request->user()->team_id);
        }

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

    public function updateObservacoesGerais(Request $request, WaitingList $waitingList)
    {
        $this->authorize('update', $waitingList);

        $data = $request->validate([
            'observacoes_gerais' => 'nullable|string',
        ]);

        $waitingList->update($data);

        return back()->with('toast', [
            'type' => 'success',
            'title' => 'Observações atualizadas',
            'description' => 'As observações gerais foram guardadas.',
        ]);
    }
}
