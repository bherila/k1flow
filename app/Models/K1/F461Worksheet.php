<?php

namespace App\Models\K1;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class F461Worksheet extends Model
{
    use SoftDeletes;

    protected $table = 'k1_f461_worksheets';

    protected $fillable = [
        'ownership_interest_id',
        'tax_year',
        'line_2',
        'line_3',
        'line_4',
        'line_5',
        'line_6',
        'line_8',
        'line_10',
        'line_11',
        'line_15',
        'notes',
    ];

    protected $casts = [
        'tax_year' => 'integer',
        'line_2' => 'decimal:2',
        'line_3' => 'decimal:2',
        'line_4' => 'decimal:2',
        'line_5' => 'decimal:2',
        'line_6' => 'decimal:2',
        'line_8' => 'decimal:2',
        'line_10' => 'decimal:2',
        'line_11' => 'decimal:2',
        'line_15' => 'decimal:2',
    ];

    /**
     * The ownership interest this worksheet belongs to.
     */
    public function ownershipInterest(): BelongsTo
    {
        return $this->belongsTo(OwnershipInterest::class, 'ownership_interest_id');
    }
}
