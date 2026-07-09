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
        Schema::table('waiting_list_admin', function (Blueprint $table) {
            $table->string('contact_result')->nullable()->after('contactado_por');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('waiting_list_admin', function (Blueprint $table) {
            $table->dropColumn('contact_result');
        });
    }
};
