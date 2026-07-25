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
            $table->text('observacoes')->nullable();

            $table->timestamps();
        });

        // 2. Alterações à tabela waiting_list
        Schema::table('waiting_list', function (Blueprint $table) {

            // Estado atual do doente
            if (!Schema::hasColumn('waiting_list', 'estado')) {
                $table->string('estado')->default('Ativo')->index();
            }

            // Data de agenda (caso seja agendado pela secretaria)
            if (!Schema::hasColumn('waiting_list', 'data_agenda')) {
                $table->date('data_agenda')->nullable();
            }

            // Data da última chamada
            if (!Schema::hasColumn('waiting_list', 'ultima_chamada_em')) {
                $table->timestamp('ultima_chamada_em')->nullable();
            }

            // Quem fez a última chamada
            if (!Schema::hasColumn('waiting_list', 'ultima_chamada_por')) {
                $table->unsignedBigInteger('ultima_chamada_por')->nullable();
                $table->foreign('ultima_chamada_por')->references('id')->on('users')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('waiting_list_calls');

        Schema::table('waiting_list', function (Blueprint $table) {
            $table->dropColumn([
                'estado',
                'data_agenda',
                'ultima_chamada_em',
                'ultima_chamada_por',
            ]);
        });
    }
};
