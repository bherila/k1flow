<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\RefreshDatabaseWithSqliteSchema;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabaseWithSqliteSchema;

    public function test_sign_up_page_loads()
    {
        $response = $this->get('/sign-up');
        $response->assertStatus(200);
    }

    public function test_sign_in_page_loads()
    {
        $response = $this->get('/sign-in');
        $response->assertStatus(200);
    }

    public function test_user_can_sign_up()
    {
        $response = $this->post('/sign-up', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertRedirect('/sign-in');
        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'name' => 'Test User',
        ]);
    }

    public function test_user_cannot_sign_in_without_verification()
    {
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        $response = $this->post('/sign-in', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        $this->assertGuest();
    }

    public function test_verified_user_can_sign_in()
    {
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);

        $response = $this->post('/sign-in', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect('/');
    }

    public function test_disabled_user_cannot_sign_in()
    {
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
            'is_disabled' => true,
        ]);

        $response = $this->post('/sign-in', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        $this->assertGuest();
    }

    public function test_user_can_sign_out()
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $this->actingAs($user);

        $response = $this->post('/sign-out');

        $this->assertGuest();
    }
}

