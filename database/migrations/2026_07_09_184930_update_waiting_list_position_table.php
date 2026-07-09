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
        Schema::table('waiting_list', function (Blueprint $table) {
            $table->integer('posicao_lista')->nullable()->index();
            //posicao relativa
            $table->integer('posicao_patologia')->nullable()->index();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('waiting_list', function (Blueprint $table) {
            $table->dropColumn('posicao_lista');
            $table->dropColumn('posicao_patologia');
        });
    }
};
