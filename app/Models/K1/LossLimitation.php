<?php

namespace App\Models\K1;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LossLimitation extends Model
{
    protected $table = 'loss_limitations';

    protected $fillable = [
        'ownership_interest_id',
        'tax_year',
        'capital_at_risk',
        'at_risk_deductible',
        'at_risk_carryover',
        'passive_activity_loss',
        'passive_loss_allowed',
        'passive_loss_carryover',
        'excess_business_loss',
        'excess_business_loss_carryover',
        'notes',
    ];

    protected $casts = [
        'tax_year' => 'integer',
        'capital_at_risk' => 'decimal:2',
        'at_risk_deductible' => 'decimal:2',
        'at_risk_carryover' => 'decimal:2',
        'passive_activity_loss' => 'decimal:2',
        'passive_loss_allowed' => 'decimal:2',
        'passive_loss_carryover' => 'decimal:2',
        'excess_business_loss' => 'decimal:2',
        'excess_business_loss_carryover' => 'decimal:2',
    ];

    /**
     * The ownership interest this limitation belongs to.
     */
    public function ownershipInterest(): BelongsTo
    {
        return $this->belongsTo(OwnershipInterest::class, 'ownership_interest_id');
    }
}
