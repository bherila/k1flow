<?php

namespace App\Models\K1;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ObAdjustment extends Model
{
    use SoftDeletes;

    protected $table = 'ob_adjustments';

    protected $fillable = [
        'outside_basis_id',
        'adjustment_category',
        'adjustment_type_code',
        'adjustment_type',
        'amount',
        'description',
        'document_path',
        'document_name',
        'sort_order',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'sort_order' => 'integer',
    ];

    /**
     * Predefined adjustment type codes for basis increases.
     * These match IRS regulations for partner basis adjustments.
     */
    public const INCREASE_TYPES = [
        'cash_contribution' => 'Cash contributions',
        'property_contribution' => 'Property contributions (FMV)',
        'increase_liabilities' => 'Increase in share of partnership liabilities',
        'assumption_personal_liabilities' => 'Partnership assumption of personal liabilities',
        'share_income' => 'Share of partnership income/gain',
        'tax_exempt_income' => 'Tax-exempt income',
        'excess_depletion' => 'Excess depletion (oil & gas)',
        'other_increase' => 'Other increase',
    ];

    /**
     * Predefined adjustment type codes for basis decreases.
     * These match IRS regulations for partner basis adjustments.
     */
    public const DECREASE_TYPES = [
        'cash_distribution' => 'Cash distributions',
        'property_distribution' => 'Property distributions (basis)',
        'decrease_liabilities' => 'Decrease in share of partnership liabilities',
        'personal_liabilities_assumed' => 'Personal liabilities assumed by partnership',
        'share_losses' => 'Share of partnership losses',
        'nondeductible_noncapital' => 'Nondeductible expenses (not capitalized)',
        'section_179' => 'Section 179 deduction',
        'depletion_deduction' => 'Oil & gas depletion deduction',
        'other_decrease' => 'Other decrease',
    ];

    /**
     * Get all adjustment types for a category.
     */
    public static function getTypesForCategory(string $category): array
    {
        return $category === 'increase' ? self::INCREASE_TYPES : self::DECREASE_TYPES;
    }

    /**
     * Get the human-readable label for an adjustment type code.
     */
    public function getTypeLabel(): string
    {
        if ($this->adjustment_type_code) {
            $types = $this->adjustment_category === 'increase' 
                ? self::INCREASE_TYPES 
                : self::DECREASE_TYPES;
            return $types[$this->adjustment_type_code] ?? $this->adjustment_type_code;
        }
        return $this->adjustment_type ?? 'Unknown';
    }

    /**
     * The outside basis this adjustment belongs to.
     */
    public function outsideBasis(): BelongsTo
    {
        return $this->belongsTo(OutsideBasis::class, 'outside_basis_id');
    }
}
