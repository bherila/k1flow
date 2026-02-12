<?php

namespace Tests\Unit;

use App\Models\User;
use Tests\RefreshDatabaseWithSqliteSchema;
use Tests\TestCase;

class UserModelTest extends TestCase
{
    use RefreshDatabaseWithSqliteSchema;

    public function test_user_can_be_created()
    {
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        $this->assertInstanceOf(User::class, $user);
        $this->assertEquals('Test User', $user->name);
        $this->assertEquals('test@example.com', $user->email);
    }

    public function test_email_verification_works()
    {
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        // Email should not be verified by default
        $this->assertFalse($user->hasVerifiedEmail());
        $this->assertNull($user->email_verified_at);

        // Mark email as verified
        $user->markEmailAsVerified();

        // Email should now be verified
        $this->assertTrue($user->hasVerifiedEmail());
        $this->assertNotNull($user->email_verified_at);
    }

    public function test_user_has_default_flags()
    {
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        // Refresh to get actual database values with defaults
        $user->refresh();

        $this->assertFalse($user->is_admin);
        $this->assertFalse($user->is_disabled);
        $this->assertFalse($user->force_change_pw);
    }

    public function test_user_can_be_soft_deleted()
    {
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        $userId = $user->id;

        // Delete the user
        $user->delete();

        // User should not be found in normal queries
        $this->assertNull(User::find($userId));

        // But should be found with trashed
        $this->assertNotNull(User::withTrashed()->find($userId));
    }
}

