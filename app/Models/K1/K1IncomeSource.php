<?php

namespace App\Models\K1;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class K1IncomeSource extends Model
{
    use SoftDeletes;

    protected $table = 'k1_income_sources';

    protected $fillable = [
        'k1_form_id',
        'income_type',
        'description',
        'amount',
        'k1_box_reference',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function k1Form(): BelongsTo
    {
        return $this->belongsTo(K1Form::class, 'k1_form_id');
    }
}
