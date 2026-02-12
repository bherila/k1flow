<?php

namespace Tests\Feature;

use Tests\RefreshDatabaseWithSqliteSchema;
use Tests\TestCase;
use App\Models\User;
use App\Models\K1\K1Company;

class AdminUserEditTest extends TestCase
{
    use RefreshDatabaseWithSqliteSchema;

    protected User $admin;
    protected User $testUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->admin()->create([
            'email' => 'admin@test.com',
        ]);

        $this->testUser = User::factory()->create([
            'email' => 'test@test.com',
            'name' => 'Test User',
        ]);
    }

    public function test_admin_can_view_edit_user_page(): void
    {
        $response = $this->actingAs($this->admin)
            ->withoutVite()
            ->get("/admin/user/{$this->testUser->id}");

        $response->assertStatus(200);
        $response->assertViewIs('admin.edit-user');
        $response->assertViewHas('userId', $this->testUser->id);
    }

    public function test_non_admin_cannot_view_edit_user_page(): void
    {
        $response = $this->actingAs($this->testUser)
            ->get("/admin/user/{$this->testUser->id}");

        $response->assertStatus(403);
    }

    public function test_admin_can_get_user_companies(): void
    {
        // Create owned company
        $ownedCompany = K1Company::factory()->create([
            'owner_user_id' => $this->testUser->id,
            'name' => 'Owned Company',
            'ein' => '12-3456789',
        ]);

        // Create shared company
        $sharedCompany = K1Company::factory()->create([
            'owner_user_id' => $this->admin->id,
            'name' => 'Shared Company',
            'ein' => '98-7654321',
        ]);
        $sharedCompany->users()->attach($this->testUser->id);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/admin/users/{$this->testUser->id}/companies");

        $response->assertStatus(200);
        $response->assertJsonCount(2);
        
        $companies = $response->json();
        
        // Check owned company
        $owned = collect($companies)->firstWhere('permission', 'owner');
        $this->assertEquals('Owned Company', $owned['name']);
        $this->assertEquals('12-3456789', $owned['ein']);
        
        // Check shared company
        $shared = collect($companies)->firstWhere('permission', 'shared');
        $this->assertEquals('Shared Company', $shared['name']);
        $this->assertEquals('98-7654321', $shared['ein']);
    }

    public function test_admin_can_update_user_details(): void
    {
        $response = $this->actingAs($this->admin)
            ->putJson("/api/admin/users/{$this->testUser->id}", [
                'name' => 'Updated Name',
                'email' => 'updated@test.com',
                'is_admin' => true,
                'is_disabled' => false,
                'force_change_pw' => true,
                'email_verified' => true,
            ]);

        $response->assertStatus(200);

        $this->testUser->refresh();
        $this->assertEquals('Updated Name', $this->testUser->name);
        $this->assertEquals('updated@test.com', $this->testUser->email);
        $this->assertTrue($this->testUser->is_admin);
        $this->assertFalse($this->testUser->is_disabled);
        $this->assertTrue($this->testUser->force_change_pw);
        $this->assertNotNull($this->testUser->email_verified_at);
    }

    public function test_admin_can_update_user_password(): void
    {
        $response = $this->actingAs($this->admin)
            ->putJson("/api/admin/users/{$this->testUser->id}", [
                'password' => 'newpassword123',
            ]);

        $response->assertStatus(200);

        $this->testUser->refresh();
        $this->assertTrue(\Hash::check('newpassword123', $this->testUser->password));
    }

    public function test_admin_can_disable_user(): void
    {
        $response = $this->actingAs($this->admin)
            ->putJson("/api/admin/users/{$this->testUser->id}", [
                'is_disabled' => true,
            ]);

        $response->assertStatus(200);

        $this->testUser->refresh();
        $this->assertTrue($this->testUser->is_disabled);
    }

    public function test_non_admin_cannot_update_user(): void
    {
        $otherUser = User::factory()->create();

        $response = $this->actingAs($otherUser)
            ->putJson("/api/admin/users/{$this->testUser->id}", [
                'name' => 'Hacked Name',
            ]);

        $response->assertStatus(403);

        $this->testUser->refresh();
        $this->assertEquals('Test User', $this->testUser->name);
    }

    public function test_user_companies_includes_soft_deleted_companies(): void
    {
        $company = K1Company::factory()->create([
            'owner_user_id' => $this->testUser->id,
            'name' => 'Deleted Company',
        ]);

        $company->delete();

        $response = $this->actingAs($this->admin)
            ->getJson("/api/admin/users/{$this->testUser->id}/companies");

        $response->assertStatus(200);
        $response->assertJsonCount(1);
        
        $companies = $response->json();
        $this->assertEquals('Deleted Company', $companies[0]['name']);
        $this->assertNotNull($companies[0]['deleted_at']);
    }

    public function test_update_validates_email_uniqueness(): void
    {
        $existingUser = User::factory()->create([
            'email' => 'existing@test.com',
        ]);

        $response = $this->actingAs($this->admin)
            ->putJson("/api/admin/users/{$this->testUser->id}", [
                'email' => 'existing@test.com',
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('email');
    }

    public function test_update_allows_keeping_same_email(): void
    {
        $response = $this->actingAs($this->admin)
            ->putJson("/api/admin/users/{$this->testUser->id}", [
                'name' => 'New Name',
                'email' => $this->testUser->email, // Same email
            ]);

        $response->assertStatus(200);
        
        $this->testUser->refresh();
        $this->assertEquals('New Name', $this->testUser->name);
    }
}
