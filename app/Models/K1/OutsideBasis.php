<?php

namespace App\Models\K1;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class OutsideBasis extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'outside_basis';

    /**
     * Create a new factory instance for the model.
     */
    protected static function newFactory()
    {
        return \Database\Factories\K1\OutsideBasisFactory::new();
    }

    protected $fillable = [
        'ownership_interest_id',
        'tax_year',
        'beginning_ob',
        'ending_ob',
        'notes',
    ];

    protected $casts = [
        'tax_year' => 'integer',
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
