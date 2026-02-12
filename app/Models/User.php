<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'pending_email',
        'is_admin',
        'is_disabled',
        'force_change_pw',
        'last_login_at',
        'email_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean',
            'is_disabled' => 'boolean',
            'force_change_pw' => 'boolean',
        ];
    }

    /**
     * Get the audit logs for this user.
     */
    public function auditLogs()
    {
        return $this->hasMany(UserAuditLog::class, 'user_id');
    }

    /**
     * Get the audit logs where this user was the acting user.
     */
    public function actingAuditLogs()
    {
        return $this->hasMany(UserAuditLog::class, 'acting_user_id');
    }

    /**
     * Get companies owned by this user.
     */
    public function ownedCompanies()
    {
        return $this->hasMany(\App\Models\K1\K1Company::class, 'owner_user_id');
    }

    /**
     * Get companies this user has shared access to.
     */
    public function companies()
    {
        return $this->belongsToMany(\App\Models\K1\K1Company::class, 'company_user', 'user_id', 'company_id')
            ->withTimestamps();
    }
}
