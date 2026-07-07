<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained('teams');
            $table->string('sala');
            $table->date('data');
            $table->time('hora_inicio');
            $table->time('hora_fim');
            $table->enum('tipo', ['programado', 'ambulatorio', 'urgente'])->default('programado');

            // Trocas
            $table->boolean('is_swapped')->default(false);
            $table->foreignId('swapped_to_team_id')->nullable()->constrained('teams');
            $table->foreignId('swap_requested_by')->nullable()->constrained('users');
            $table->foreignId('swap_approved_by')->nullable()->constrained('users');
            $table->text('swap_reason')->nullable();


            $table->enum('repeat_type', ['none', 'daily', 'weekly', 'monthly'])->default('none');
            $table->date('repeat_until')->nullable(); // repetir até data
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('slots');
    }
};
