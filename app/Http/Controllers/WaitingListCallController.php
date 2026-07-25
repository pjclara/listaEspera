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
        $doente = WaitingList::findOrFail($id);

        // Não permitir chamar alguém já suspenso ou agendado
        if (in_array($doente->estado, ['Suspenso', 'Agendado', 'Operado'])) {
            return back()->with('error', 'Doente não pode ser chamado.');
        }

        // Atualizar estado para SUSPENSO
        $doente->estado_anterior = $doente->estado;
        $doente->estado = 'Suspenso';
        $doente->save();

        // Registar pedido
        DB::table('waiting_list_calls')->insert([
            'waiting_list_id'      => $id,
            'pedido_por_user_id'   => auth()->id(),
            'pedido_em'            => now(),
            'tipo_chamada'         => $request->tipo_chamada, // Ambulatório/Base/SIGIC
            'data_pretendida'      => $request->data_pretendida,
            'estado_anterior'      => $doente->estado_anterior,
            'estado_novo'          => 'Suspenso',
            'created_at'           => now(),
            'updated_at'           => now(),
        ]);

        return back()->with('success', 'Doente colocado em suspensão e pedido enviado à secretaria.');
    }

    public function respostaChamada(Request $request, int $callId)
    {
        $request->validate([
            'resultado' => ['required', 'in:Agendado,VoltaLista,Recusou,NA,Indisponível'],
            'data_agenda' => ['required_if:resultado,Agendado', 'nullable', 'date'],
            'observacoes' => ['nullable', 'string'],
        ]);

        $call = DB::table('waiting_list_calls')->where('id', $callId)->first();
        if (!$call) {
            return back()->with('error', 'Pedido de chamada não encontrado.');
        }

        $doente = DB::table('waiting_list')->where('id', $call->waiting_list_id)->first();
        if (!$doente) {
            return back()->with('error', 'Doente não encontrado.');
        }

        $estadoAnterior = $call->estado_anterior ?? 'Ativo';
        $resultado = $request->resultado;

        // 1. Atualizar estado do doente
        if ($resultado === 'Agendado') {

            DB::table('waiting_list')->where('id', $doente->id)->update([
                'estado' => 'Agendado',
                'data_agenda' => $request->data_agenda,
                'ultima_chamada_em' => now(),
                'ultima_chamada_por' => auth()->id(),
                'updated_at' => now(),
            ]);
        } else {

            DB::table('waiting_list')->where('id', $doente->id)->update([
                'estado' => $estadoAnterior,
                'ultima_chamada_em' => now(),
                'ultima_chamada_por' => auth()->id(),
                'updated_at' => now(),
            ]);
        }

        // 2. Atualizar o pedido de chamada
        DB::table('waiting_list_calls')->where('id', $callId)->update([
            'resultado' => $resultado,
            'secretaria_user_id' => auth()->id(),
            'secretaria_em' => now(),
            'observacoes' => $request->observacoes,
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
