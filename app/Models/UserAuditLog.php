<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Request;

class UserAuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'acting_user_id',
        'event_name',
        'is_successful',
        'message',
        'ip',
    ];

    protected $casts = [
        'is_successful' => 'boolean',
    ];

    /**
     * Get the user this audit log belongs to.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the user who performed this action.
     */
    public function actingUser()
    {
        return $this->belongsTo(User::class, 'acting_user_id');
    }

    /**
     * Get the client IP address (check Cloudflare header first).
     */
    public static function getClientIp(): ?string
    {
        return request()->header('CF-Connecting-IP') ?? request()->ip();
    }

    /**
     * Create an audit log entry.
     */
    public static function log(
        int $userId,
        string $eventName,
        bool $isSuccessful = true,
        ?string $message = null,
        ?int $actingUserId = null
    ): self {
        return self::create([
            'user_id' => $userId,
            'acting_user_id' => $actingUserId ?? auth()->id(),
            'event_name' => $eventName,
            'is_successful' => $isSuccessful,
            'message' => $message,
            'ip' => self::getClientIp(),
        ]);
    }
}
