<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('waiting_list_history', function (Blueprint $table) {
            $table->id();

            $table->foreignId('waiting_list_id')
                ->constrained('waiting_list')
                ->onDelete('cascade');

            $table->string('campo_alterado');     // nome do campo alterado
            $table->text('valor_antigo')->nullable();
            $table->text('valor_novo')->nullable();

            $table->timestamp('alterado_em');     // NOW() no Python
            $table->string('origem')->default('excel');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('waiting_list_history');
    }
};
