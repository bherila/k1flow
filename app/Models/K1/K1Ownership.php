<?php

namespace App\Models\K1;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class K1Ownership extends Model
{
    protected $table = 'k1_ownership';

    protected $fillable = [
        'owner_company_id',
        'owned_company_id',
        'ownership_percentage',
        'effective_from',
        'effective_to',
        'ownership_class',
        'notes',
    ];

    protected $casts = [
        'ownership_percentage' => 'decimal:4',
        'effective_from' => 'date',
        'effective_to' => 'date',
    ];

    /**
     * The company that owns (parent/investor).
     */
    public function ownerCompany(): BelongsTo
    {
        return $this->belongsTo(K1Company::class, 'owner_company_id');
    }

    /**
     * The company that is owned (subsidiary/investee).
     */
    public function ownedCompany(): BelongsTo
    {
        return $this->belongsTo(K1Company::class, 'owned_company_id');
    }
}
