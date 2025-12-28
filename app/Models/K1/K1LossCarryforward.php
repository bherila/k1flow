<?php

namespace App\Models\K1;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class K1LossCarryforward extends Model
{
    protected $table = 'k1_loss_carryforwards';

    protected $fillable = [
        'k1_form_id',
        'loss_type',
        'character',
        'amount',
        'origination_year',
        'utilized_current_year',
        'remaining_carryforward',
        'description',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'utilized_current_year' => 'decimal:2',
        'remaining_carryforward' => 'decimal:2',
    ];

    public function k1Form(): BelongsTo
    {
        return $this->belongsTo(K1Form::class, 'k1_form_id');
    }
}
