<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Adds structured adjustment type codes to ob_adjustments table
     * for the basis walk feature. These hardcoded types cover the most
     * common basis adjustments per IRS regulations.
     */
    public function up(): void
    {
        Schema::table('ob_adjustments', function (Blueprint $table) {
            // Add a structured adjustment type code for predefined types
            // Null means it's a custom/other adjustment using adjustment_type text field
            $table->string('adjustment_type_code', 50)->nullable()->after('adjustment_category');
            
            // Supporting documentation file path
            $table->string('document_path')->nullable()->after('description');
            $table->string('document_name')->nullable()->after('document_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ob_adjustments', function (Blueprint $table) {
            $table->dropColumn(['adjustment_type_code', 'document_path', 'document_name']);
        });
    }
};
