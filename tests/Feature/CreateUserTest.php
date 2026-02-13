<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\RefreshDatabaseWithSqliteSchema;
use Tests\TestCase;

class CreateUserTest extends TestCase
{
    use RefreshDatabaseWithSqliteSchema;

    public function test_admin_can_create_user()
    {
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
            'is_admin' => true,
        ]);

        $this->actingAs($admin);

        $response = $this->postJson('/api/admin/users', [
            'name' => 'New User',
            'email' => 'new@example.com',
            'password' => 'password123',
            'is_admin' => false,
            'is_disabled' => false,
            'force_change_pw' => false,
            'email_verified' => true,
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', ['email' => 'new@example.com']);
    }

    public function test_admin_can_create_user_with_short_password()
    {
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin2@example.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
            'is_admin' => true,
        ]);

        $this->actingAs($admin);

        $response = $this->postJson('/api/admin/users', [
            'name' => 'Short Pw User',
            'email' => 'short@example.com',
            'password' => '12345',
            'is_admin' => false,
            'is_disabled' => false,
            'force_change_pw' => false,
            'email_verified' => true,
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', ['email' => 'short@example.com']);
        
        $user = User::where('email', 'short@example.com')->first();
        $this->assertTrue(\Hash::check('12345', $user->password));
    }

    public function test_create_user_validates_email()
    {
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
            'is_admin' => true,
        ]);

        $this->actingAs($admin);

        $response = $this->postJson('/api/admin/users', [
            'name' => 'New User',
            'email' => 'invalid-email',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('email');
    }
}
