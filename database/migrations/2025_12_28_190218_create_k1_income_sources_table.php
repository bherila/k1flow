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
        Schema::create('k1_income_sources', function (Blueprint $table) {
            $table->id();
            $table->foreignId('k1_form_id')->constrained('k1_forms')->cascadeOnDelete();
            
            // Income source type: passive, non-passive, capital, trade_or_business_461l
            $table->enum('income_type', ['passive', 'non_passive', 'capital', 'trade_or_business_461l']);
            
            $table->string('description')->nullable();
            $table->decimal('amount', 16, 2);
            $table->string('k1_box_reference')->nullable(); // e.g., "Box 1", "Box 2"
            $table->text('notes')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('k1_income_sources');
    }
};
