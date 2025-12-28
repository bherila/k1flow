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
        Schema::create('k1_loss_carryforwards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('k1_form_id')->constrained('k1_forms')->cascadeOnDelete();
            
            // Suspended losses including type and character
            $table->enum('loss_type', [
                'ordinary',
                'capital_short_term',
                'capital_long_term',
                'section_1231',
                'passive',
                'at_risk',
                'excess_business_loss',
                'other'
            ]);
            
            $table->string('character')->nullable(); // Further characterization
            $table->decimal('amount', 16, 2);
            $table->integer('origination_year')->nullable(); // Year the loss originated
            $table->decimal('utilized_current_year', 16, 2)->nullable();
            $table->decimal('remaining_carryforward', 16, 2)->nullable();
            
            $table->text('description')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('k1_loss_carryforwards');
    }
};
