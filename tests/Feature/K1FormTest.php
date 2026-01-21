<?php

namespace Tests\Feature;

use App\Models\K1\K1Company;
use App\Models\K1\OwnershipInterest;
use App\Models\K1\K1Form;
use Tests\RefreshDatabaseWithSqliteSchema;
use Tests\TestCase;

class K1FormTest extends TestCase
{
    use RefreshDatabaseWithSqliteSchema;

    public function test_can_create_and_retrieve_k1_form_for_ownership_interest()
    {
        // 1. Setup
        $owner = K1Company::create(['name' => 'Owner']);
        $owned = K1Company::create(['name' => 'Owned']);

        $interest = OwnershipInterest::create([
            'owner_company_id' => $owner->id,
            'owned_company_id' => $owned->id,
            'ownership_percentage' => 0.50,
        ]);

        // 2. Create K1 via API
        $response = $this->postJson("/api/ownership-interests/{$interest->id}/k1s", [
            'tax_year' => 2024,
            'box_1_ordinary_income' => 5000,
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('k1_forms', [
            'ownership_interest_id' => $interest->id,
            'tax_year' => 2024,
            'box_1_ordinary_income' => 5000,
        ]);

        // 3. Retrieve K1s for interest
        $response = $this->getJson("/api/ownership-interests/{$interest->id}/k1s");
        $response->assertOk()
            ->assertJsonCount(1)
            ->assertJsonFragment(['tax_year' => 2024]);

        // 4. Retrieve specific K1
        $formId = $response->json()[0]['id'];
        $response = $this->getJson("/api/forms/{$formId}");
        $response->assertOk()
            ->assertJsonFragment(['box_1_ordinary_income' => 5000]);
    }
}
