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
     * Get ownership records where this company is the owner.
     */
    public function ownedCompanies(): HasMany
    {
        return $this->hasMany(K1Ownership::class, 'owner_company_id');
    }

    /**
     * Get ownership records where this company is owned by others.
     */
    public function owners(): HasMany
    {
        return $this->hasMany(K1Ownership::class, 'owned_company_id');
    }
}
