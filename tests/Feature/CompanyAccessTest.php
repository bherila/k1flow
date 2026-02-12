<?php

namespace Tests\Feature;

use App\Models\K1\K1Company;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Tests\RefreshDatabaseWithSqliteSchema;
use Tests\TestCase;

class CompanyAccessTest extends TestCase
{
    use RefreshDatabaseWithSqliteSchema;

    protected User $owner;
    protected User $sharedUser;
    protected User $otherUser;
    protected K1Company $company;

    protected function setUp(): void
    {
        parent::setUp();

        // Create users
        $this->owner = User::factory()->create();
        $this->sharedUser = User::factory()->create();
        $this->otherUser = User::factory()->create();

        // Create company owned by owner
        $this->company = K1Company::create([
            'name' => 'Test Company',
            'owner_user_id' => $this->owner->id,
        ]);

        // Grant shared access to sharedUser
        $this->company->users()->attach($this->sharedUser->id);
    }

    public function test_owner_can_access_company()
    {
        $this->actingAs($this->owner);
        
        $this->assertTrue(
            Gate::allows('access-company', $this->company),
            'Owner should have access to their company'
        );
    }

    public function test_shared_user_can_access_company()
    {
        $this->actingAs($this->sharedUser);
        
        $this->assertTrue(
            Gate::allows('access-company', $this->company),
            'User with shared access should have access to company'
        );
    }

    public function test_other_user_cannot_access_company()
    {
        $this->actingAs($this->otherUser);
        
        $this->assertFalse(
            Gate::allows('access-company', $this->company),
            'User without access should not have access to company'
        );
    }

    public function test_owner_can_view_company()
    {
        $response = $this->actingAs($this->owner)
            ->getJson("/api/companies/{$this->company->id}");

        $response->assertStatus(200)
            ->assertJson(['name' => 'Test Company']);
    }

    public function test_shared_user_can_view_company()
    {
        $response = $this->actingAs($this->sharedUser)
            ->getJson("/api/companies/{$this->company->id}");

        $response->assertStatus(200)
            ->assertJson(['name' => 'Test Company']);
    }

    public function test_other_user_cannot_view_company()
    {
        $response = $this->actingAs($this->otherUser)
            ->getJson("/api/companies/{$this->company->id}");

        $response->assertStatus(403);
    }

    public function test_owner_can_update_company()
    {
        $response = $this->actingAs($this->owner)
            ->putJson("/api/companies/{$this->company->id}", [
                'name' => 'Updated Company Name',
            ]);

        $response->assertStatus(200)
            ->assertJson(['name' => 'Updated Company Name']);

        $this->assertDatabaseHas('k1_companies', [
            'id' => $this->company->id,
            'name' => 'Updated Company Name',
        ]);
    }

    public function test_shared_user_can_update_company()
    {
        $response = $this->actingAs($this->sharedUser)
            ->putJson("/api/companies/{$this->company->id}", [
                'name' => 'Updated by Shared User',
            ]);

        $response->assertStatus(200)
            ->assertJson(['name' => 'Updated by Shared User']);
    }

    public function test_other_user_cannot_update_company()
    {
        $response = $this->actingAs($this->otherUser)
            ->putJson("/api/companies/{$this->company->id}", [
                'name' => 'Unauthorized Update',
            ]);

        $response->assertStatus(403);
    }

    public function test_owner_can_delete_company()
    {
        $response = $this->actingAs($this->owner)
            ->deleteJson("/api/companies/{$this->company->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('k1_companies', [
            'id' => $this->company->id,
        ]);
    }

    public function test_other_user_cannot_delete_company()
    {
        $response = $this->actingAs($this->otherUser)
            ->deleteJson("/api/companies/{$this->company->id}");

        $response->assertStatus(403);

        $this->assertDatabaseHas('k1_companies', [
            'id' => $this->company->id,
        ]);
    }

    public function test_user_only_sees_their_companies()
    {
        $otherCompany = K1Company::create([
            'name' => 'Other Company',
            'owner_user_id' => $this->otherUser->id,
        ]);

        $response = $this->actingAs($this->owner)
            ->getJson('/api/companies');

        $response->assertStatus(200);
        
        $companies = $response->json();
        $this->assertCount(1, $companies);
        $this->assertEquals($this->company->id, $companies[0]['id']);
    }

    public function test_new_company_is_owned_by_creator()
    {
        $response = $this->actingAs($this->owner)
            ->postJson('/api/companies', [
                'name' => 'New Company',
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('k1_companies', [
            'name' => 'New Company',
            'owner_user_id' => $this->owner->id,
        ]);
    }
}
