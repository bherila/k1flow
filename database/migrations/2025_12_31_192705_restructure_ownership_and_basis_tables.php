<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Restructures the database to properly relate outside basis and loss limitations
     * to ownership interests rather than individual K-1 forms.
     */
    public function up(): void
    {
        // 1. Drop old tables that reference k1_form_id (no data to migrate)
        Schema::dropIfExists('k1_ob_adjustments');
        Schema::dropIfExists('k1_loss_carryforwards');
        Schema::dropIfExists('k1_loss_limitations');
        Schema::dropIfExists('k1_outside_basis');
        Schema::dropIfExists('k1_ownership');

        // 2. Create ownership_interests table
        // This represents a taxpayer's ownership stake in a partnership/S-corp
        // The owner is implicit (the logged-in taxpayer) - owned_company is what they own
        Schema::create('ownership_interests', function (Blueprint $table) {
            $table->id();
            
            // The company that owns (could be individual taxpayer's holding entity, or tiered structure)
            $table->foreignId('owner_company_id')->nullable()->constrained('k1_companies')->cascadeOnDelete();
            
            // The partnership/S-corp entity being owned
            $table->foreignId('owned_company_id')->constrained('k1_companies')->cascadeOnDelete();
            
            // Ownership percentage with high precision: Decimal(14,11) gives us
            // up to 999% (for edge cases) with 11 decimal places precision
            // e.g., 25.12345678901%
            $table->decimal('ownership_percentage', 14, 11);
            
            // Effective dates for ownership
            $table->date('effective_from')->nullable();
            $table->date('effective_to')->nullable(); // NULL means currently active
            
            // Ownership class (for multi-class partnerships)
            $table->string('ownership_class')->nullable(); // e.g., "Class A", "Common", "Preferred"
            
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Prevent duplicate ownership records for the same relationship
            $table->unique(['owner_company_id', 'owned_company_id', 'effective_from'], 'unique_ownership_interest');
        });

        // 3. Create outside_basis table linked to ownership_interest with tax_year
        // Basis is tracked per-ownership-interest per-tax-year
        Schema::create('outside_basis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ownership_interest_id')->constrained('ownership_interests')->cascadeOnDelete();
            $table->integer('tax_year'); // The year this basis applies to
            
            // Inception basis fields (how the interest was acquired - typically only set in first year)
            $table->decimal('contributed_cash_property', 16, 2)->nullable();
            $table->decimal('purchase_price', 16, 2)->nullable();
            $table->decimal('gift_inheritance', 16, 2)->nullable();
            $table->decimal('taxable_compensation', 16, 2)->nullable();
            $table->decimal('inception_basis_total', 16, 2)->nullable();
            
            // Year-specific basis tracking
            $table->decimal('beginning_ob', 16, 2)->nullable();
            $table->decimal('ending_ob', 16, 2)->nullable();
            
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // One record per ownership interest per year
            $table->unique(['ownership_interest_id', 'tax_year'], 'unique_ob_per_year');
        });

        // 4. Create ob_adjustments table for basis adjustments (CPA work product)
        Schema::create('ob_adjustments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('outside_basis_id')->constrained('outside_basis')->cascadeOnDelete();
            
            // Adjustment details
            $table->enum('adjustment_category', ['increase', 'decrease']);
            $table->string('adjustment_type')->nullable(); // e.g., "Share of income", "Distributions"
            $table->decimal('amount', 16, 2)->nullable();
            $table->text('description')->nullable();
            $table->integer('sort_order')->default(0);
            
            $table->timestamps();
        });

        // 5. Create loss_limitations table linked to ownership_interest with tax_year
        Schema::create('loss_limitations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ownership_interest_id')->constrained('ownership_interests')->cascadeOnDelete();
            $table->integer('tax_year');
            
            // Form 6198 - At-Risk Limitations
            $table->decimal('capital_at_risk', 16, 2)->nullable();
            $table->decimal('at_risk_deductible', 16, 2)->nullable();
            $table->decimal('at_risk_carryover', 16, 2)->nullable();
            
            // Form 8582 - Passive Activity Loss Limitations
            $table->decimal('passive_activity_loss', 16, 2)->nullable();
            $table->decimal('passive_loss_allowed', 16, 2)->nullable();
            $table->decimal('passive_loss_carryover', 16, 2)->nullable();
            
            // Section 461(l) - Excess Business Loss Limitation
            $table->decimal('excess_business_loss', 16, 2)->nullable();
            $table->decimal('excess_business_loss_carryover', 16, 2)->nullable();
            
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // One record per ownership interest per year
            $table->unique(['ownership_interest_id', 'tax_year'], 'unique_loss_limit_per_year');
        });

        // 6. Create loss_carryforwards table linked to ownership_interest
        Schema::create('loss_carryforwards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ownership_interest_id')->constrained('ownership_interests')->cascadeOnDelete();
            
            // Which year the loss originated
            $table->integer('origin_year');
            
            // Type of carryforward
            $table->enum('carryforward_type', ['at_risk', 'passive', 'excess_business_loss']);
            
            // Character of the loss (for passive losses)
            $table->string('loss_character')->nullable(); // e.g., "Ordinary", "Capital", "1231"
            
            // Original and remaining amounts
            $table->decimal('original_amount', 16, 2);
            $table->decimal('remaining_amount', 16, 2);
            
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loss_carryforwards');
        Schema::dropIfExists('loss_limitations');
        Schema::dropIfExists('ob_adjustments');
        Schema::dropIfExists('outside_basis');
        Schema::dropIfExists('ownership_interests');
        
        // Recreate old tables structure (simplified - would need full recreation in production)
        Schema::create('k1_ownership', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_company_id')->nullable()->constrained('k1_companies')->cascadeOnDelete();
            $table->foreignId('owned_company_id')->constrained('k1_companies')->cascadeOnDelete();
            $table->decimal('ownership_percentage', 8, 4);
            $table->date('effective_from')->nullable();
            $table->date('effective_to')->nullable();
            $table->string('ownership_class')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('k1_outside_basis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('k1_form_id')->constrained('k1_forms')->cascadeOnDelete();
            $table->decimal('contributed_cash_property', 16, 2)->nullable();
            $table->decimal('purchase_price', 16, 2)->nullable();
            $table->decimal('gift_inheritance', 16, 2)->nullable();
            $table->decimal('taxable_compensation', 16, 2)->nullable();
            $table->decimal('inception_basis_total', 16, 2)->nullable();
            $table->decimal('beginning_ob', 16, 2)->nullable();
            $table->decimal('ending_ob', 16, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('k1_loss_limitations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('k1_form_id')->constrained('k1_forms')->cascadeOnDelete();
            $table->decimal('capital_at_risk', 16, 2)->nullable();
            $table->decimal('at_risk_deductible', 16, 2)->nullable();
            $table->decimal('at_risk_carryover', 16, 2)->nullable();
            $table->decimal('passive_activity_loss', 16, 2)->nullable();
            $table->decimal('passive_loss_allowed', 16, 2)->nullable();
            $table->decimal('passive_loss_carryover', 16, 2)->nullable();
            $table->decimal('excess_business_loss', 16, 2)->nullable();
            $table->decimal('excess_business_loss_carryover', 16, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('k1_loss_carryforwards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('k1_form_id')->constrained('k1_forms')->cascadeOnDelete();
            $table->integer('origin_year');
            $table->enum('carryforward_type', ['at_risk', 'passive', 'excess_business_loss']);
            $table->string('loss_character')->nullable();
            $table->decimal('original_amount', 16, 2);
            $table->decimal('remaining_amount', 16, 2);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('k1_ob_adjustments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('outside_basis_id')->constrained('k1_outside_basis')->cascadeOnDelete();
            $table->enum('adjustment_category', ['increase', 'decrease']);
            $table->string('adjustment_type')->nullable();
            $table->decimal('amount', 16, 2)->nullable();
            $table->text('description')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }
};
