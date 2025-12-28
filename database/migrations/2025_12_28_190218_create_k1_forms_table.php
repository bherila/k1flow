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
        Schema::create('k1_forms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('k1_companies')->cascadeOnDelete();
            $table->integer('tax_year');
            
            // File storage for the K-1 form PDF
            $table->string('form_file_path')->nullable();
            $table->string('form_file_name')->nullable();
            
            // Part I - Information About the Partnership (boxes A-J)
            $table->string('partnership_name')->nullable(); // Box A
            $table->string('partnership_address')->nullable(); // Box A continued
            $table->string('partnership_ein')->nullable(); // Box A1 - EIN
            $table->date('partnership_tax_year_begin')->nullable(); // Box A2
            $table->date('partnership_tax_year_end')->nullable(); // Box A2
            $table->string('irs_center')->nullable(); // Box B
            $table->boolean('is_publicly_traded')->default(false); // Box C
            
            // Part II - Information About the Partner (boxes D-L)
            $table->string('partner_ssn_ein')->nullable(); // Box D
            $table->string('partner_name')->nullable(); // Box E
            $table->string('partner_address')->nullable(); // Box E continued
            $table->boolean('is_general_partner')->nullable(); // Box F
            $table->boolean('is_limited_partner')->nullable(); // Box F
            $table->boolean('is_domestic_partner')->nullable(); // Box G
            $table->boolean('is_foreign_partner')->nullable(); // Box G
            $table->boolean('is_disregarded_entity')->nullable(); // Box H
            $table->string('entity_type_code')->nullable(); // Box I1
            $table->boolean('is_retirement_plan')->nullable(); // Box I2
            
            // Part II - Partner's Share (boxes J-L)
            $table->decimal('share_of_profit_beginning', 8, 4)->nullable(); // Box J - beginning %
            $table->decimal('share_of_profit_ending', 8, 4)->nullable(); // Box J - ending %
            $table->decimal('share_of_loss_beginning', 8, 4)->nullable(); // Box J - beginning %
            $table->decimal('share_of_loss_ending', 8, 4)->nullable(); // Box J - ending %
            $table->decimal('share_of_capital_beginning', 8, 4)->nullable(); // Box J - beginning %
            $table->decimal('share_of_capital_ending', 8, 4)->nullable(); // Box J - ending %
            
            // Box K - Partner's Share of Liabilities
            $table->decimal('nonrecourse_liabilities', 16, 2)->nullable(); // Box K
            $table->decimal('qualified_nonrecourse_financing', 16, 2)->nullable(); // Box K
            $table->decimal('recourse_liabilities', 16, 2)->nullable(); // Box K
            $table->decimal('total_liabilities', 16, 2)->nullable(); // Computed or entered
            
            // Box L - Partner's Capital Account Analysis
            $table->decimal('beginning_capital_account', 16, 2)->nullable();
            $table->decimal('capital_contributed', 16, 2)->nullable();
            $table->decimal('current_year_income_loss', 16, 2)->nullable();
            $table->decimal('withdrawals_distributions', 16, 2)->nullable();
            $table->decimal('other_increase_decrease', 16, 2)->nullable();
            $table->decimal('ending_capital_account', 16, 2)->nullable();
            $table->boolean('capital_account_tax_basis')->nullable(); // Box L checkbox
            $table->boolean('capital_account_gaap')->nullable();
            $table->boolean('capital_account_section_704b')->nullable();
            $table->boolean('capital_account_other')->nullable();
            $table->string('capital_account_other_description')->nullable();
            
            // Part III - Partner's Share of Current Year Income, Deductions, Credits, and Other Items
            // Box 1-23 are common K-1 line items
            $table->decimal('box_1_ordinary_income', 16, 2)->nullable(); // Ordinary business income (loss)
            $table->decimal('box_2_net_rental_real_estate', 16, 2)->nullable();
            $table->decimal('box_3_other_net_rental', 16, 2)->nullable();
            $table->decimal('box_4a_guaranteed_payments_services', 16, 2)->nullable();
            $table->decimal('box_4b_guaranteed_payments_capital', 16, 2)->nullable();
            $table->decimal('box_4c_guaranteed_payments_total', 16, 2)->nullable();
            $table->decimal('box_5_interest_income', 16, 2)->nullable();
            $table->decimal('box_6a_ordinary_dividends', 16, 2)->nullable();
            $table->decimal('box_6b_qualified_dividends', 16, 2)->nullable();
            $table->decimal('box_6c_dividend_equivalents', 16, 2)->nullable();
            $table->decimal('box_7_royalties', 16, 2)->nullable();
            $table->decimal('box_8_net_short_term_capital_gain', 16, 2)->nullable();
            $table->decimal('box_9a_net_long_term_capital_gain', 16, 2)->nullable();
            $table->decimal('box_9b_collectibles_gain', 16, 2)->nullable();
            $table->decimal('box_9c_unrecaptured_1250_gain', 16, 2)->nullable();
            $table->decimal('box_10_net_section_1231_gain', 16, 2)->nullable();
            $table->text('box_11_other_income')->nullable(); // JSON or text for coded items
            $table->decimal('box_12_section_179_deduction', 16, 2)->nullable();
            $table->text('box_13_other_deductions')->nullable(); // JSON or text
            $table->decimal('box_14_self_employment_earnings', 16, 2)->nullable();
            $table->text('box_15_credits')->nullable(); // JSON or text
            $table->text('box_16_foreign_transactions')->nullable(); // JSON or text
            $table->text('box_17_amt_items')->nullable(); // Alternative Minimum Tax items
            $table->text('box_18_tax_exempt_income')->nullable();
            $table->text('box_19_distributions')->nullable();
            $table->text('box_20_other_info')->nullable(); // JSON or text for coded items
            $table->text('box_21_foreign_taxes_paid')->nullable();
            $table->text('box_22_more_info')->nullable();
            
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Unique constraint: one K-1 per company per year
            $table->unique(['company_id', 'tax_year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('k1_forms');
    }
};
