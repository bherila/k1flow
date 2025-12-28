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
        Schema::create('k1_ownership', function (Blueprint $table) {
            $table->id();
            
            // The owner - can be another company (for tiered structures) or null (individual/top-level)
            $table->foreignId('owner_company_id')->nullable()->constrained('k1_companies')->cascadeOnDelete();
            
            // The entity being owned
            $table->foreignId('owned_company_id')->constrained('k1_companies')->cascadeOnDelete();
            
            // Ownership percentage (what % of distributions the owner receives)
            $table->decimal('ownership_percentage', 8, 4); // e.g., 25.5000 = 25.5%
            
            // Effective dates for ownership
            $table->date('effective_from')->nullable();
            $table->date('effective_to')->nullable(); // NULL means currently active
            
            // Ownership class (for future complexity)
            $table->string('ownership_class')->nullable(); // e.g., "Class A", "Common", "Preferred"
            
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Prevent duplicate ownership records for the same relationship
            $table->unique(['owner_company_id', 'owned_company_id', 'effective_from'], 'unique_ownership');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('k1_ownership');
    }
};
