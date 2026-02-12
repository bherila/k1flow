<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\RefreshDatabaseWithSqliteSchema;
use Tests\TestCase;

class AdminAccessTest extends TestCase
{
    use RefreshDatabaseWithSqliteSchema;

    public function test_non_admin_cannot_access_admin_pages()
    {
        // Create a dummy user first to ensure our test user doesn't get ID 1
        User::create([
            'name' => 'Dummy User',
            'email' => 'dummy@example.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);
        
        $user = User::create([
            'name' => 'Regular User',
            'email' => 'user@example.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
            'is_admin' => false,
        ]);

        $this->actingAs($user);

        $response = $this->get('/admin/users');
        $response->assertStatus(403);
    }

    public function test_admin_can_access_admin_pages()
    {
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
            'is_admin' => true,
        ]);

        $this->actingAs($admin);

        $response = $this->get('/admin/users');
        $response->assertStatus(200);
    }

    public function test_user_id_1_is_always_admin()
    {
        // Create user with ID 1
        $user = User::create([
            'id' => 1,
            'name' => 'First User',
            'email' => 'first@example.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
            'is_admin' => false, // Even with is_admin = false, should be admin
        ]);

        $this->actingAs($user);

        $response = $this->get('/admin/users');
        $response->assertStatus(200);
    }

    public function test_non_admin_cannot_access_admin_api()
    {
        // Create a dummy user first to ensure our test user doesn't get ID 1
        User::create([
            'name' => 'Dummy User',
            'email' => 'dummy@example.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);
        
        $user = User::create([
            'name' => 'Regular User',
            'email' => 'user@example.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
            'is_admin' => false,
        ]);

        $this->actingAs($user);

        $response = $this->get('/api/admin/users');
        $response->assertStatus(403);
    }

    public function test_admin_can_list_users_via_api()
    {
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
            'is_admin' => true,
        ]);

        User::create([
            'name' => 'Regular User',
            'email' => 'user@example.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);

        $this->actingAs($admin);

        $response = $this->getJson('/api/admin/users');
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                '*' => ['id', 'name', 'email']
            ]
        ]);
    }
}

