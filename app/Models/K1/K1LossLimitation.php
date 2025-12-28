<?php

namespace App\Models\K1;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class K1LossLimitation extends Model
{
    protected $table = 'k1_loss_limitations';

    protected $fillable = [
        'k1_form_id',
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
        'capital_at_risk' => 'decimal:2',
        'at_risk_deductible' => 'decimal:2',
        'at_risk_carryover' => 'decimal:2',
        'passive_activity_loss' => 'decimal:2',
        'passive_loss_allowed' => 'decimal:2',
        'passive_loss_carryover' => 'decimal:2',
        'excess_business_loss' => 'decimal:2',
        'excess_business_loss_carryover' => 'decimal:2',
    ];

    public function k1Form(): BelongsTo
    {
        return $this->belongsTo(K1Form::class, 'k1_form_id');
    }
}
