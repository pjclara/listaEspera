<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('waiting_list', function (Blueprint $table) {
            $table->id(); // NUM_LISTA_ESPERA

            // Datas
            $table->date('data_marcacao')->nullable();      // DTA_MARCACAO
            $table->date('data_operado')->nullable();       // DTA_OPERADO
            $table->date('data_agenda')->nullable();        // DTA_AGENDA
            $table->date('data_cancel')->nullable();        // DTA_CANCEL

            // Campos principais
            $table->integer('prioridade')->nullable();      // PRIORIDADE
            $table->string('regime')->nullable();           // Regime
            $table->string('situacao')->nullable();         // Situacao
            $table->string('situacao_interna')->default('Ativo');         // Situacao
            $table->string('estado')->nullable();           // ESTADO

            // Processo / paciente
            $table->string('num_processo')->nullable();     // NUM_PROCESSO
            $table->string('sexo')->nullable();             // SEXO
            $table->string('nome')->nullable();             // SEXO
            $table->string('des_grupo')->nullable();        // DES_GRUPO

            // Médico
            $table->integer('cod_medico')->nullable();      // COD_MEDICO
            $table->string('nome_clinico')->nullable();     // NOME_CLINICO

            // Diagnóstico / patologia
            $table->string('patologia')->nullable();        // PATOLOGIA
            $table->text('des_diagnostico')->nullable();    // DES_DIAGNOSTICO

            // Procedimento
            $table->string('interv_cirurgica')->nullable(); // INTERV_CIRURGICA

            // Cancelamento
            $table->string('cancel')->nullable();           // CANCEL
            $table->string('des_cancel')->nullable();       // DES_CANCEL

            // Equipa (opcional)
            $table->foreignId('team_id')->nullable()->constrained('teams');

            // Atualização via Excel
            $table->timestamp('updated_from_excel_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('waiting_list');
    }
};
