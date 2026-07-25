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
            $table->text('observacoes_gerais')->nullable()->after('des_cancel');
            $table->text('observacoes_secretaria')->nullable()->after('observacoes_gerais');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('waiting_list', function (Blueprint $table) {
            $table->dropColumn('observacoes_gerais');
            $table->dropColumn('observacoes_secretaria');
        });
    }
};
