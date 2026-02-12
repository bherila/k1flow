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
        $tables = [
            'k1_companies',
            'k1_forms',
            'k1_income_sources',
            'ownership_interests',
            'outside_basis',
            'loss_limitations',
            'loss_carryforwards',
            'k1_f461_worksheets',
            'ob_adjustments',
        ];

        foreach ($tables as $table) {
            Schema::table($table, function (Blueprint $blueprint) use ($table) {
                if (!Schema::hasColumn($table, 'deleted_at')) {
                    $blueprint->softDeletes();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = [
            'k1_companies',
            'k1_forms',
            'k1_income_sources',
            'ownership_interests',
            'outside_basis',
            'loss_limitations',
            'loss_carryforwards',
            'k1_f461_worksheets',
            'ob_adjustments',
        ];

        foreach ($tables as $table) {
            Schema::table($table, function (Blueprint $blueprint) use ($table) {
                if (Schema::hasColumn($table, 'deleted_at')) {
                    $blueprint->dropSoftDeletes();
                }
            });
        }
    }
};
