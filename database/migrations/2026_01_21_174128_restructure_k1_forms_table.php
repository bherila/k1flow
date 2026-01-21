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
        // Check if column exists (handling partial failure from previous run)
        if (!Schema::hasColumn('k1_forms', 'ownership_interest_id')) {
            Schema::table('k1_forms', function (Blueprint $table) {
                $table->foreignId('ownership_interest_id')
                      ->nullable()
                      ->after('id')
                      ->constrained('ownership_interests')
                      ->onDelete('cascade');
            });
        }

        Schema::table('k1_forms', function (Blueprint $table) {
            // Drop Foreign Key FIRST (Crucial for MySQL)
            $table->dropForeign(['company_id']);
            
            // Then Drop Unique Index
            // Note: If the index was used for the FK, dropping the FK might not drop the index automatically,
            // but dropping the index requires the FK to be gone.
            $table->dropUnique('k1_forms_company_id_tax_year_unique');
            
            // Then Drop Column
            $table->dropColumn('company_id');

            // Add new unique index
            $table->unique(['ownership_interest_id', 'tax_year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('k1_forms', function (Blueprint $table) {
            $table->foreignId('company_id')
                  ->nullable()
                  ->constrained('k1_companies')
                  ->onDelete('cascade');
        });

        Schema::table('k1_forms', function (Blueprint $table) {
             $table->dropUnique(['ownership_interest_id', 'tax_year']);
             
             // Check if FK exists before dropping to be safe in down too? 
             // Laravel schema builder doesn't have hasForeign easily in down.
             // But we know we added it.
             $table->dropForeign(['ownership_interest_id']);
             $table->dropColumn('ownership_interest_id');
             
             $table->unique(['company_id', 'tax_year'], 'k1_forms_company_id_tax_year_unique');
        });
    }
};
