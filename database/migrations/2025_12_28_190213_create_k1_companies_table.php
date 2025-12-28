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
        Schema::create('k1_companies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('ein')->nullable(); // Employer Identification Number
            $table->string('entity_type')->nullable(); // e.g., Partnership, S-Corp, LLC
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('zip')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('k1_companies');
    }
};
