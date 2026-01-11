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
        Schema::create('k1_f461_worksheets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ownership_interest_id')->constrained('ownership_interests')->onDelete('cascade');
            $table->integer('tax_year');
            
            // Part I
            $table->decimal('line_2', 16, 2)->nullable();
            $table->decimal('line_3', 16, 2)->nullable();
            $table->decimal('line_4', 16, 2)->nullable();
            $table->decimal('line_5', 16, 2)->nullable();
            $table->decimal('line_6', 16, 2)->nullable();
            $table->decimal('line_8', 16, 2)->nullable();
            
            // Part II
            $table->decimal('line_10', 16, 2)->nullable();
            $table->decimal('line_11', 16, 2)->nullable();
            
            // Part III
            $table->decimal('line_15', 16, 2)->nullable();
            
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['ownership_interest_id', 'tax_year'], 'f461_interest_year_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('k1_f461_worksheets');
    }
};
