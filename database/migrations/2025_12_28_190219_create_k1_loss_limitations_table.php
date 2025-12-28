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
        Schema::create('k1_loss_limitations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('k1_form_id')->constrained('k1_forms')->cascadeOnDelete();
            
            // Loss Limitation Categories (IRS forms 6198, 8582)
            // Form 6198 - At-Risk Limitations
            $table->decimal('capital_at_risk', 16, 2)->nullable(); // Form 6198
            $table->decimal('at_risk_deductible', 16, 2)->nullable();
            $table->decimal('at_risk_carryover', 16, 2)->nullable();
            
            // Form 8582 - Passive Activity Loss Limitations
            $table->decimal('passive_activity_loss', 16, 2)->nullable(); // Form 8582
            $table->decimal('passive_loss_allowed', 16, 2)->nullable();
            $table->decimal('passive_loss_carryover', 16, 2)->nullable();
            
            // Section 461(l) - Excess Business Loss Limitation
            $table->decimal('excess_business_loss', 16, 2)->nullable();
            $table->decimal('excess_business_loss_carryover', 16, 2)->nullable();
            
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('k1_loss_limitations');
    }
};
