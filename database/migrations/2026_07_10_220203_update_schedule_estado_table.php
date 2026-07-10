<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            // atualiza a coluna 'estado' para incluir o novo valor 'proposto'
            $table->string('estado')->default('proposto')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('waiting_list_schedules', function (Blueprint $table) {
            // reverte a coluna 'estado' para o valor original
            $table->enum('estado', \App\Enum\ScheduleEstadoTypes::getAll())->default(\App\Enum\ScheduleEstadoTypes::PROPOSTO->value)->change();
        });
    }
};
