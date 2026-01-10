<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Enhances inception basis tracking with:
     * - Full date instead of just year
     * - Method of acquisition (purchase, gift, inheritance, compensation, contribution)
     * - Inheritance-specific fields (date, cost basis/FMV)
     * - NOL carryforward tracking for Section 461(l) EBL -> NOL conversion
     */
    public function up(): void
    {
        Schema::table('ownership_interests', function (Blueprint $table) {
            // Convert inception_basis_year to full date
            $table->date('inception_date')->nullable()->after('ownership_class');
            
            // Method of acquisition - mutually exclusive options
            // Values: 'purchase', 'gift', 'inheritance', 'compensation', 'contribution'
            $table->string('method_of_acquisition', 50)->nullable()->after('inception_date');
            
            // Inheritance-specific fields
            $table->date('inheritance_date')->nullable()->after('method_of_acquisition');
            $table->decimal('cost_basis_inherited', 16, 2)->nullable()->after('inheritance_date');
            
            // Gift-specific fields (carryover basis from donor)
            $table->date('gift_date')->nullable()->after('cost_basis_inherited');
            $table->decimal('gift_donor_basis', 16, 2)->nullable()->after('gift_date');
            $table->decimal('gift_fmv_at_transfer', 16, 2)->nullable()->after('gift_donor_basis');
        });

        // Add NOL carryforward tracking to loss_carryforwards table
        // EBL from year N becomes NOL in year N+1 (per Section 461(l))
        Schema::table('loss_carryforwards', function (Blueprint $table) {
            // Add 'nol' as a valid carryforward type option
            // The column already exists as enum/string, so we just document the new value
            // Add source tracking for EBL -> NOL conversion
            $table->integer('source_ebl_year')->nullable()->after('carryforward_type');
        });

        // Add NOL fields to loss_limitations for annual tracking
        Schema::table('loss_limitations', function (Blueprint $table) {
            // NOL deduction used in current year
            $table->decimal('nol_deduction_used', 16, 2)->nullable()->after('excess_business_loss_carryover');
            // NOL carryforward remaining after current year use
            $table->decimal('nol_carryforward', 16, 2)->nullable()->after('nol_deduction_used');
            // 80% limitation applies to post-2017 NOLs in years after 2020
            $table->decimal('nol_80_percent_limit', 16, 2)->nullable()->after('nol_carryforward');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ownership_interests', function (Blueprint $table) {
            $table->dropColumn([
                'inception_date',
                'method_of_acquisition',
                'inheritance_date',
                'cost_basis_inherited',
                'gift_date',
                'gift_donor_basis',
                'gift_fmv_at_transfer',
            ]);
        });

        Schema::table('loss_carryforwards', function (Blueprint $table) {
            $table->dropColumn('source_ebl_year');
        });

        Schema::table('loss_limitations', function (Blueprint $table) {
            $table->dropColumn([
                'nol_deduction_used',
                'nol_carryforward',
                'nol_80_percent_limit',
            ]);
        });
    }
};
