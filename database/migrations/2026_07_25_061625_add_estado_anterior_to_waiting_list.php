<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('waiting_list', function (Blueprint $table) {
            $table->string('estado_anterior')->nullable()->after('estado');
        });
    }

    public function down()
    {
        Schema::table('waiting_list', function (Blueprint $table) {
            $table->dropColumn('estado_anterior');
        });
    }
};
