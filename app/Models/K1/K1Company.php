<?php

namespace App\Models\K1;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class K1Company extends Model
{
    protected $table = 'k1_companies';

    protected $fillable = [
        'name',
        'ein',
        'entity_type',
        'address',
        'city',
        'state',
        'zip',
        'notes',
    ];

    /**
     * Get all K-1 forms for this company.
     */
    public function k1Forms(): HasMany
    {
        return $this->hasMany(K1Form::class, 'company_id');
    }

    /**
     * Get ownership interests where this company is the owner (investor).
     * These are partnerships/S-corps that this company owns.
     */
    public function ownershipInterests(): HasMany
    {
        return $this->hasMany(OwnershipInterest::class, 'owner_company_id');
    }

    /**
     * Get ownership interests where this company is owned (the entity being invested in).
     * These represent who owns this company.
     */
    public function ownedBy(): HasMany
    {
        return $this->hasMany(OwnershipInterest::class, 'owned_company_id');
    }
}
