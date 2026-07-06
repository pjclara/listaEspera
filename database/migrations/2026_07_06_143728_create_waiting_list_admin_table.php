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
        Schema::create('waiting_list_admin', function (Blueprint $table) {
            $table->id();

            $table->foreignId('waiting_list_id')
                ->constrained('waiting_list')
                ->onDelete('cascade');

            $table->boolean('contactado')->default(false);
            $table->date('data_contacto')->nullable();
            $table->string('contactado_por')->nullable();

            $table->text('observacoes')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('waiting_list_admin');
    }
};
