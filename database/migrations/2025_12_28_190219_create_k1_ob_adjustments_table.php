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
        Schema::create('k1_ob_adjustments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('outside_basis_id')->constrained('k1_outside_basis')->cascadeOnDelete();
            
            // CPA Work Product - OB adjustments for each year
            // Positive adjustments (increases)
            $table->decimal('contributed_cash_property', 16, 2)->nullable();
            $table->decimal('increase_share_liabilities', 16, 2)->nullable();
            $table->decimal('share_income_gain', 16, 2)->nullable();
            $table->decimal('excess_depletion', 16, 2)->nullable(); // Oil & gas specific
            
            // Negative adjustments (decreases)
            $table->decimal('distributions', 16, 2)->nullable();
            $table->decimal('losses', 16, 2)->nullable();
            $table->decimal('decrease_share_liabilities', 16, 2)->nullable();
            
            // Adjustment type for categorization
            $table->enum('adjustment_category', ['increase', 'decrease']);
            $table->string('description')->nullable();
            
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('k1_ob_adjustments');
    }
};
