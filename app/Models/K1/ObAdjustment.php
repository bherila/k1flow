<?php

namespace App\Models\K1;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ObAdjustment extends Model
{
    protected $table = 'ob_adjustments';

    protected $fillable = [
        'outside_basis_id',
        'adjustment_category',
        'adjustment_type',
        'amount',
        'description',
        'sort_order',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'sort_order' => 'integer',
    ];

    /**
     * The outside basis this adjustment belongs to.
     */
    public function outsideBasis(): BelongsTo
    {
        return $this->belongsTo(OutsideBasis::class, 'outside_basis_id');
    }
}
