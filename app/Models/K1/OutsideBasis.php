<?php

namespace App\Models\K1;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OutsideBasis extends Model
{
    protected $table = 'outside_basis';

    protected $fillable = [
        'ownership_interest_id',
        'tax_year',
        'contributed_cash_property',
        'purchase_price',
        'gift_inheritance',
        'taxable_compensation',
        'inception_basis_total',
        'beginning_ob',
        'ending_ob',
        'notes',
    ];

    protected $casts = [
        'tax_year' => 'integer',
        'contributed_cash_property' => 'decimal:2',
        'purchase_price' => 'decimal:2',
        'gift_inheritance' => 'decimal:2',
        'taxable_compensation' => 'decimal:2',
        'inception_basis_total' => 'decimal:2',
        'beginning_ob' => 'decimal:2',
        'ending_ob' => 'decimal:2',
    ];

    /**
     * The ownership interest this basis belongs to.
     */
    public function ownershipInterest(): BelongsTo
    {
        return $this->belongsTo(OwnershipInterest::class, 'ownership_interest_id');
    }

    /**
     * Adjustments to this outside basis.
     */
    public function adjustments(): HasMany
    {
        return $this->hasMany(ObAdjustment::class, 'outside_basis_id')->orderBy('sort_order');
    }
}
