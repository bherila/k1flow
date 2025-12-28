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
        Schema::create('k1_outside_basis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('k1_form_id')->constrained('k1_forms')->cascadeOnDelete();
            
            // Inception basis fields (how the interest was acquired)
            $table->decimal('contributed_cash_property', 16, 2)->nullable();
            $table->decimal('purchase_price', 16, 2)->nullable();
            $table->decimal('gift_inheritance', 16, 2)->nullable();
            $table->decimal('taxable_compensation', 16, 2)->nullable();
            $table->decimal('inception_basis_total', 16, 2)->nullable(); // Sum of above
            
            // Starting outside basis for the year
            $table->decimal('beginning_ob', 16, 2)->nullable();
            
            // Ending outside basis for the year (computed or entered)
            $table->decimal('ending_ob', 16, 2)->nullable();
            
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('k1_outside_basis');
    }
};
