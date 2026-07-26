<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tabela de histórico de chamadas
        Schema::create('waiting_list_calls', function (Blueprint $table) {
            $table->id();

            // FK para o doente na lista de espera
            $table->unsignedBigInteger('waiting_list_id');
            $table->foreign('waiting_list_id')->references('id')->on('waiting_list')->onDelete('cascade');

            // Quem pediu a chamada (equipa)
            $table->unsignedBigInteger('pedido_por_user_id')->nullable();
            $table->foreign('pedido_por_user_id')->references('id')->on('users')->nullOnDelete();

            $table->timestamp('pedido_em')->nullable();

            // Tipo de chamada: Ambulatorio / Base / SIGIC
            $table->string('tipo_chamada')->nullable();

            // Data pretendida pela equipa
            $table->date('data_pretendida')->nullable();

            // Observações de quem pede
            $table->text('observacoes_pedido')->nullable();

            // Data pretendida pela equipa
            $table->date('data_agendada')->nullable();

            // Estado antes da suspensão
            $table->string('estado_anterior')->nullable();

            // Estado após pedido (normalmente "Suspenso")
            $table->string('estado_novo')->nullable();

            // Resultado da secretaria:
            // Agendado / VoltaLista / Recusou / NA / Indisponível
            $table->string('resultado')->nullable();

            // Secretaria que contactou
            $table->unsignedBigInteger('secretaria_user_id')->nullable();
            $table->foreign('secretaria_user_id')->references('id')->on('users')->nullOnDelete();

            $table->timestamp('secretaria_em')->nullable();

            // Observações da secretaria
            $table->text('observacoes_secretaria')->nullable();

            $table->timestamps();
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('waiting_list_calls');

    }
};
