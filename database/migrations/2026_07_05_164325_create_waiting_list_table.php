<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('waiting_list', function (Blueprint $table) {
            $table->id(); // ID do Excel
            $table->date('data_inscricao')->nullable();
            $table->integer('prioridade')->nullable();
            $table->string('origem')->nullable();
            $table->string('estado')->nullable();
            $table->string('sexo')->nullable();
            $table->integer('episodio_id')->nullable();
            $table->string('instituicao')->nullable();
            $table->integer('medico_id')->nullable();
            $table->string('medico_nome')->nullable();
            $table->string('diagnostico_cid')->nullable();
            $table->text('diagnostico_desc')->nullable();
            $table->string('procedimento_pcs')->nullable();
            $table->date('data_prevista')->nullable();
            $table->integer('duracao_estimada')->nullable();
            $table->string('motivo_cancelamento')->nullable();
            $table->foreignId('equipa_id')->nullable()->constrained('teams');
            $table->timestamp('updated_from_excel_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('waiting_list');
    }
};
