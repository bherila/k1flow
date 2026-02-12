<?php

namespace Tests\Feature;

use App\Models\K1\K1Company;
use App\Models\K1\OwnershipInterest;
use App\Models\User;
use Tests\RefreshDatabaseWithSqliteSchema;
use Tests\TestCase;

class OwnershipInterestAccessTest extends TestCase
{
    use RefreshDatabaseWithSqliteSchema;

    public function test_user_sees_only_interests_between_accessible_companies()
    {
        // Users
        $owner = User::factory()->create();
        $other = User::factory()->create();

        // Companies
        $companyOwned = K1Company::create(['name' => 'Owned Company', 'owner_user_id' => $owner->id]);
        $companyShared = K1Company::create(['name' => 'Shared Company', 'owner_user_id' => $other->id]);
        $companyOther = K1Company::create(['name' => 'Other Company', 'owner_user_id' => $other->id]);

        // Grant shared access to $owner for $companyShared
        $companyShared->users()->attach($owner->id);

        // Interests
        // Visible: both companies accessible to $owner
        $visible = OwnershipInterest::create([
            'owner_company_id' => $companyOwned->id,
            'owned_company_id' => $companyShared->id,
            'ownership_percentage' => 50,
        ]);

        // Hidden: owner not accessible to $owner
        $hidden1 = OwnershipInterest::create([
            'owner_company_id' => $companyOther->id,
            'owned_company_id' => $companyShared->id,
            'ownership_percentage' => 25,
        ]);

        // Hidden: owned company not accessible to $owner
        $hidden2 = OwnershipInterest::create([
            'owner_company_id' => $companyOwned->id,
            'owned_company_id' => $companyOther->id,
            'ownership_percentage' => 10,
        ]);

        // Act as the owner and fetch interests
        $response = $this->actingAs($owner)
            ->getJson('/api/ownership-interests');

        $response->assertStatus(200);

        $list = $response->json();

        // Only the visible interest should be returned
        $this->assertCount(1, $list);
        $this->assertEquals($visible->id, $list[0]['id']);
    }
}
