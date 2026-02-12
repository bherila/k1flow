<?php

namespace App\Models\K1;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

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
        'owner_user_id',
    ];

    /**
     * Get the owner of this company.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'owner_user_id');
    }

    /**
     * Get all users who have access to this company (shared access).
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(\App\Models\User::class, 'company_user')
            ->withTimestamps();
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
    /**
     * Get all K-1 forms issued by this company (via ownership interests).
     */
    public function k1Forms(): HasManyThrough
    {
        return $this->hasManyThrough(
            K1Form::class,
            OwnershipInterest::class,
            'owned_company_id', // Foreign key on ownership_interests table...
            'ownership_interest_id', // Foreign key on k1_forms table...
            'id', // Local key on k1_companies table...
            'id' // Local key on ownership_interests table...
        );
    }
}
