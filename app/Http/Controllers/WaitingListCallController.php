<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\WaitingList;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class WaitingListCallController extends Controller
{
    public function pedirChamada(Request $request, int $id)
    {
        // validate
        $validate = $request->validate([
            'data_pretendida' => 'required|date|after:today',
            'tipo_chamada' => 'required|string',
            'observacoes' => 'nullable'
        ]);
        $doente = WaitingList::findOrFail($id);

        // Não permitir chamar alguém já suspenso ou agendado
        if ($doente->call && in_array($doente->call->estado_novo, ['Suspenso', 'Agendado', 'Operado'])) {
            return back()->with('error', 'Doente não pode ser chamado.');
        }
        // Registar pedido
        DB::table('waiting_list_calls')->insert([
            'waiting_list_id'      => $id,
            'pedido_por_user_id'   => auth()->id(),
            'pedido_em'            => now(),
            'tipo_chamada'         => $validate['tipo_chamada'], // Ambulatório/Base/SIGIC
            'data_pretendida'      => $validate['data_pretendida'],
            'observacoes_pedido'   => $validate['observacoes'],
            'estado_novo'          => 'Suspenso',
            'created_at'           => now(),
            'updated_at'           => now(),
        ]);

        return back()->with('toast', [
            'type' => 'success',
            'title' => 'Convocatória criada com sucesso',
            'description' =>  'Doente colocado em suspensão e pedido enviado à secretaria.',
        ]);
    }

    public function respostaChamada(Request $request, int $callId)
    {
        $request->validate([
            'resultado' => ['required', 'in:Agendado,VoltaLista,Recusou,Indisponível,NA,Aceitou Outro Hospital'],
            'data_agendada' => ['required_if:resultado,Agendado', 'nullable', 'date'],
            'observacoes' => ['nullable', 'string'],
        ]);

        $call = DB::table('waiting_list_calls')->where('id', $callId)->first();
        if (!$call) {
            return back()->with('error', 'Pedido de chamada não encontrado.');
        }

        $estadoAnterior = $call->estado_anterior ?? 'Ativo';
        $resultado = $request->resultado;

        // 2. Atualizar o pedido de chamada
        DB::table('waiting_list_calls')->where('id', $callId)->update([
            'secretaria_user_id' => auth()->id(),
            'secretaria_em' => now(),
            'estado_anterior' => $call->estado_novo,
            'estado_novo' => $request->resultado,
            'data_agendada' => $request->data_agendada,
            'observacoes_secretaria' => $request->observacoes,
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Resposta registada com sucesso.');
    }


    public function chamadasPendentes()
    {
        $chamadas = DB::table('waiting_list_calls')
            ->whereNull('resultado')
            ->orderBy('pedido_em', 'asc')
            ->get()
            ->map(function ($call) {
                $call->doente = DB::table('waiting_list')->where('id', $call->waiting_list_id)->first();
                $call->pedido_por_user = DB::table('users')->where('id', $call->pedido_por_user_id)->first();
                return $call;
            });

        return Inertia::render('WaitingList/ChamadasPendentes', [
            'chamadas' => $chamadas,
        ]);
    }
}
