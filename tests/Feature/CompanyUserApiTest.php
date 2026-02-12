<?php

namespace Tests\Feature;

use App\Models\K1\K1Company;
use App\Models\User;
use Tests\RefreshDatabaseWithSqliteSchema;
use Tests\TestCase;

class CompanyUserApiTest extends TestCase
{
    use RefreshDatabaseWithSqliteSchema;

    protected User $owner;
    protected User $user1;
    protected User $user2;
    protected K1Company $company;

    protected function setUp(): void
    {
        parent::setUp();

        $this->owner = User::factory()->create();
        $this->user1 = User::factory()->create();
        $this->user2 = User::factory()->create();

        $this->company = K1Company::create([
            'name' => 'Test Company',
            'owner_user_id' => $this->owner->id,
        ]);
    }

    public function test_owner_can_list_users_with_access()
    {
        $this->company->users()->attach($this->user1->id);

        $response = $this->actingAs($this->owner)
            ->getJson("/api/companies/{$this->company->id}/users");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'owner' => ['id', 'name', 'email'],
                'shared_users',
            ]);

        $data = $response->json();
        $this->assertEquals($this->owner->id, $data['owner']['id']);
        $this->assertCount(1, $data['shared_users']);
        $this->assertEquals($this->user1->id, $data['shared_users'][0]['id']);
    }

    public function test_owner_can_grant_access_to_user()
    {
        $response = $this->actingAs($this->owner)
            ->postJson("/api/companies/{$this->company->id}/users", [
                'user_id' => $this->user1->id,
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('company_user', [
            'company_id' => $this->company->id,
            'user_id' => $this->user1->id,
        ]);
    }

    public function test_cannot_grant_access_to_nonexistent_user()
    {
        $response = $this->actingAs($this->owner)
            ->postJson("/api/companies/{$this->company->id}/users", [
                'user_id' => 99999,
            ]);

        $response->assertStatus(422);
    }

    public function test_cannot_grant_access_to_owner()
    {
        $response = $this->actingAs($this->owner)
            ->postJson("/api/companies/{$this->company->id}/users", [
                'user_id' => $this->owner->id,
            ]);

        $response->assertStatus(422)
            ->assertJson(['message' => 'Owner already has access to the company']);
    }

    public function test_cannot_grant_duplicate_access()
    {
        $this->company->users()->attach($this->user1->id);

        $response = $this->actingAs($this->owner)
            ->postJson("/api/companies/{$this->company->id}/users", [
                'user_id' => $this->user1->id,
            ]);

        $response->assertStatus(422)
            ->assertJson(['message' => 'User already has access to the company']);
    }

    public function test_owner_can_revoke_user_access()
    {
        $this->company->users()->attach($this->user1->id);

        $response = $this->actingAs($this->owner)
            ->deleteJson("/api/companies/{$this->company->id}/users/{$this->user1->id}");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('company_user', [
            'company_id' => $this->company->id,
            'user_id' => $this->user1->id,
        ]);
    }

    public function test_cannot_revoke_owner_access()
    {
        $response = $this->actingAs($this->owner)
            ->deleteJson("/api/companies/{$this->company->id}/users/{$this->owner->id}");

        $response->assertStatus(422)
            ->assertJson(['message' => 'Cannot remove owner access']);
    }

    public function test_shared_user_can_grant_access()
    {
        $this->company->users()->attach($this->user1->id);

        $response = $this->actingAs($this->user1)
            ->postJson("/api/companies/{$this->company->id}/users", [
                'user_id' => $this->user2->id,
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('company_user', [
            'company_id' => $this->company->id,
            'user_id' => $this->user2->id,
        ]);
    }

    public function test_user_without_access_cannot_grant_access()
    {
        $response = $this->actingAs($this->user1)
            ->postJson("/api/companies/{$this->company->id}/users", [
                'user_id' => $this->user2->id,
            ]);

        $response->assertStatus(403);
    }

    public function test_user_search_returns_matching_users()
    {
        $testUser = User::factory()->create([
            'email' => 'test.search@example.com',
        ]);

        $response = $this->actingAs($this->owner)
            ->getJson('/api/users/search?q=test.search');

        $response->assertStatus(200);
        
        $users = $response->json();
        $this->assertGreaterThan(0, count($users));
        
        $emails = array_column($users, 'email');
        $this->assertContains('test.search@example.com', $emails);
    }

    public function test_user_search_requires_auth()
    {
        $response = $this->getJson('/api/users/search?q=test');

        $response->assertStatus(401);
    }

    public function test_user_search_requires_minimum_query_length()
    {
        $response = $this->actingAs($this->owner)
            ->getJson('/api/users/search?q=a');

        $response->assertStatus(200);
        $this->assertEquals([], $response->json());
    }
}
