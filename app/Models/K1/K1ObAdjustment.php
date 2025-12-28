<?php

namespace App\Models\K1;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class K1ObAdjustment extends Model
{
    protected $table = 'k1_ob_adjustments';

    protected $fillable = [
        'outside_basis_id',
        'contributed_cash_property',
        'increase_share_liabilities',
        'share_income_gain',
        'excess_depletion',
        'distributions',
        'losses',
        'decrease_share_liabilities',
        'adjustment_category',
        'description',
        'notes',
    ];

    protected $casts = [
        'contributed_cash_property' => 'decimal:2',
        'increase_share_liabilities' => 'decimal:2',
        'share_income_gain' => 'decimal:2',
        'excess_depletion' => 'decimal:2',
        'distributions' => 'decimal:2',
        'losses' => 'decimal:2',
        'decrease_share_liabilities' => 'decimal:2',
    ];

    public function outsideBasis(): BelongsTo
    {
        return $this->belongsTo(K1OutsideBasis::class, 'outside_basis_id');
    }
}
