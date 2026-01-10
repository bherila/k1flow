<?php

namespace App\Models\K1;

use App\Traits\SerializesDatesAsLocal;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OwnershipInterest extends Model
{
    use SerializesDatesAsLocal;

    protected $table = 'ownership_interests';

    protected $fillable = [
        'owner_company_id',
        'owned_company_id',
        'ownership_percentage',
        'effective_from',
        'effective_to',
        'ownership_class',
        'notes',
        'inception_basis_year',
        'inception_date',
        'method_of_acquisition',
        'inheritance_date',
        'cost_basis_inherited',
        'gift_date',
        'gift_donor_basis',
        'gift_fmv_at_transfer',
        'contributed_cash_property',
        'purchase_price',
        'gift_inheritance',
        'taxable_compensation',
        'inception_basis_total',
    ];

    protected $casts = [
        'ownership_percentage' => 'decimal:11',
        'effective_from' => 'date',
        'effective_to' => 'date',
        'inception_basis_year' => 'integer',
        'inception_date' => 'date',
        'inheritance_date' => 'date',
        'gift_date' => 'date',
        'contributed_cash_property' => 'decimal:2',
        'purchase_price' => 'decimal:2',
        'gift_inheritance' => 'decimal:2',
        'taxable_compensation' => 'decimal:2',
        'inception_basis_total' => 'decimal:2',
        'cost_basis_inherited' => 'decimal:2',
        'gift_donor_basis' => 'decimal:2',
        'gift_fmv_at_transfer' => 'decimal:2',
    ];

    /**
     * The company that owns (parent/investor).
     * Nullable for top-level individual ownership.
     */
    public function ownerCompany(): BelongsTo
    {
        return $this->belongsTo(K1Company::class, 'owner_company_id');
    }

    /**
     * The company that is owned (subsidiary/investee).
     */
    public function ownedCompany(): BelongsTo
    {
        return $this->belongsTo(K1Company::class, 'owned_company_id');
    }

    /**
     * Outside basis records for this ownership interest.
     */
    public function outsideBasis(): HasMany
    {
        return $this->hasMany(OutsideBasis::class, 'ownership_interest_id');
    }

    /**
     * Get outside basis for a specific tax year.
     */
    public function outsideBasisForYear(int $taxYear): ?OutsideBasis
    {
        return $this->outsideBasis()->where('tax_year', $taxYear)->first();
    }

    /**
     * Loss limitations for this ownership interest.
     */
    public function lossLimitations(): HasMany
    {
        return $this->hasMany(LossLimitation::class, 'ownership_interest_id');
    }

    /**
     * Get loss limitations for a specific tax year.
     */
    public function lossLimitationsForYear(int $taxYear): ?LossLimitation
    {
        return $this->lossLimitations()->where('tax_year', $taxYear)->first();
    }

    /**
     * Loss carryforwards for this ownership interest.
     */
    public function lossCarryforwards(): HasMany
    {
        return $this->hasMany(LossCarryforward::class, 'ownership_interest_id');
    }
}
