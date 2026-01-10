<?php

namespace App\Models\K1;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LossCarryforward extends Model
{
    protected $table = 'loss_carryforwards';

    protected $fillable = [
        'ownership_interest_id',
        'origin_year',
        'carryforward_type',
        'source_ebl_year',
        'loss_character',
        'original_amount',
        'remaining_amount',
        'notes',
    ];

    protected $casts = [
        'origin_year' => 'integer',
        'source_ebl_year' => 'integer',
        'original_amount' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
    ];

    /**
     * The ownership interest this carryforward belongs to.
     */
    public function ownershipInterest(): BelongsTo
    {
        return $this->belongsTo(OwnershipInterest::class, 'ownership_interest_id');
    }
}
