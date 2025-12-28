<?php

namespace App\Models\K1;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class K1OutsideBasis extends Model
{
    protected $table = 'k1_outside_basis';

    protected $fillable = [
        'k1_form_id',
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
        'contributed_cash_property' => 'decimal:2',
        'purchase_price' => 'decimal:2',
        'gift_inheritance' => 'decimal:2',
        'taxable_compensation' => 'decimal:2',
        'inception_basis_total' => 'decimal:2',
        'beginning_ob' => 'decimal:2',
        'ending_ob' => 'decimal:2',
    ];

    public function k1Form(): BelongsTo
    {
        return $this->belongsTo(K1Form::class, 'k1_form_id');
    }

    public function adjustments(): HasMany
    {
        return $this->hasMany(K1ObAdjustment::class, 'outside_basis_id');
    }
}
