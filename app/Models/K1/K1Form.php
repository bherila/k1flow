<?php

namespace App\Models\K1;

use App\Traits\SerializesDatesAsLocal;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class K1Form extends Model
{
    use HasFactory, SerializesDatesAsLocal, SoftDeletes;

    protected $table = 'k1_forms';

    /**
     * Create a new factory instance for the model.
     */
    protected static function newFactory()
    {
        return \Database\Factories\K1\K1FormFactory::new();
    }

    protected $fillable = [
        'ownership_interest_id',
        'tax_year',
        'form_file_path',
        'form_file_name',
        // Part I
        'partnership_name',
        'partnership_address',
        'partnership_ein',
        'partnership_tax_year_begin',
        'partnership_tax_year_end',
        'irs_center',
        'is_publicly_traded',
        // Part II
        'partner_ssn_ein',
        'partner_name',
        'partner_address',
        'is_general_partner',
        'is_limited_partner',
        'is_domestic_partner',
        'is_foreign_partner',
        'is_disregarded_entity',
        'entity_type_code',
        'is_retirement_plan',
        // Share percentages
        'share_of_profit_beginning',
        'share_of_profit_ending',
        'share_of_loss_beginning',
        'share_of_loss_ending',
        'share_of_capital_beginning',
        'share_of_capital_ending',
        // Liabilities
        'nonrecourse_liabilities',
        'qualified_nonrecourse_financing',
        'recourse_liabilities',
        'total_liabilities',
        // Capital account
        'beginning_capital_account',
        'capital_contributed',
        'current_year_income_loss',
        'withdrawals_distributions',
        'other_increase_decrease',
        'ending_capital_account',
        'capital_account_tax_basis',
        'capital_account_gaap',
        'capital_account_section_704b',
        'capital_account_other',
        'capital_account_other_description',
        // Part III boxes
        'box_1_ordinary_income',
        'box_2_net_rental_real_estate',
        'box_3_other_net_rental',
        'box_4a_guaranteed_payments_services',
        'box_4b_guaranteed_payments_capital',
        'box_4c_guaranteed_payments_total',
        'box_5_interest_income',
        'box_6a_ordinary_dividends',
        'box_6b_qualified_dividends',
        'box_6c_dividend_equivalents',
        'box_7_royalties',
        'box_8_net_short_term_capital_gain',
        'box_9a_net_long_term_capital_gain',
        'box_9b_collectibles_gain',
        'box_9c_unrecaptured_1250_gain',
        'box_10_net_section_1231_gain',
        'box_11_other_income',
        'box_12_section_179_deduction',
        'box_13_other_deductions',
        'box_14_self_employment_earnings',
        'box_15_credits',
        'box_16_foreign_transactions',
        'box_17_amt_items',
        'box_18_tax_exempt_income',
        'box_19_distributions',
        'box_20_other_info',
        'box_21_foreign_taxes_paid',
        'box_22_more_info',
        'notes',
    ];

    protected $casts = [
        'partnership_tax_year_begin' => 'date',
        'partnership_tax_year_end' => 'date',
        'is_publicly_traded' => 'boolean',
        'is_general_partner' => 'boolean',
        'is_limited_partner' => 'boolean',
        'is_domestic_partner' => 'boolean',
        'is_foreign_partner' => 'boolean',
        'is_disregarded_entity' => 'boolean',
        'is_retirement_plan' => 'boolean',
        'capital_account_tax_basis' => 'boolean',
        'capital_account_gaap' => 'boolean',
        'capital_account_section_704b' => 'boolean',
        'capital_account_other' => 'boolean',
        // Decimal casts for money fields
        'share_of_profit_beginning' => 'decimal:4',
        'share_of_profit_ending' => 'decimal:4',
        'share_of_loss_beginning' => 'decimal:4',
        'share_of_loss_ending' => 'decimal:4',
        'share_of_capital_beginning' => 'decimal:4',
        'share_of_capital_ending' => 'decimal:4',
        'nonrecourse_liabilities' => 'decimal:2',
        'qualified_nonrecourse_financing' => 'decimal:2',
        'recourse_liabilities' => 'decimal:2',
        'total_liabilities' => 'decimal:2',
        'beginning_capital_account' => 'decimal:2',
        'capital_contributed' => 'decimal:2',
        'current_year_income_loss' => 'decimal:2',
        'withdrawals_distributions' => 'decimal:2',
        'other_increase_decrease' => 'decimal:2',
        'ending_capital_account' => 'decimal:2',
    ];

    public function ownershipInterest(): BelongsTo
    {
        return $this->belongsTo(OwnershipInterest::class, 'ownership_interest_id');
    }

    public function incomeSources(): HasMany
    {
        return $this->hasMany(K1IncomeSource::class, 'k1_form_id');
    }
}
