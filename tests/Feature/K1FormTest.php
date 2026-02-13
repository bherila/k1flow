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

    public function test_can_upsert_and_retrieve_k1_form_by_interest_and_tax_year()
    {
        $user = \App\Models\User::factory()->create();
        $this->actingAs($user);
        
        $owner = K1Company::create(['name' => 'Owner', 'owner_user_id' => $user->id]);
        $owned = K1Company::create(['name' => 'Owned', 'owner_user_id' => $user->id]);

        $interest = OwnershipInterest::create([
            'owner_company_id' => $owner->id,
            'owned_company_id' => $owned->id,
            'ownership_percentage' => 0.50,
            'inception_basis_year' => 2024,
        ]);

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

        $response = $this->postJson("/api/ownership-interests/{$interest->id}/k1s", [
            'tax_year' => 2024,
            'box_1_ordinary_income' => 7500,
        ]);

        $response->assertOk()
            ->assertJsonFragment(['tax_year' => 2024])
            ->assertJsonFragment(['box_1_ordinary_income' => 7500]);

        $response = $this->getJson("/api/ownership-interests/{$interest->id}/k1s");
        $response->assertOk()
            ->assertJsonCount(1)
            ->assertJsonFragment(['tax_year' => 2024]);

        $response = $this->getJson("/api/ownership-interests/{$interest->id}/k1s/2024");
        $response->assertOk()
            ->assertJsonFragment(['box_1_ordinary_income' => 7500]);
    }

    public function test_k1_show_returns_404_or_403_for_out_of_bounds_years_based_on_data_presence()
    {
        $user = \App\Models\User::factory()->create();
        $this->actingAs($user);

        $owner = K1Company::create(['name' => 'Owner', 'owner_user_id' => $user->id]);
        $owned = K1Company::create(['name' => 'Owned', 'owner_user_id' => $user->id]);

        $interest = OwnershipInterest::create([
            'owner_company_id' => $owner->id,
            'owned_company_id' => $owned->id,
            'ownership_percentage' => 0.50,
            'inception_basis_year' => 2024,
            'effective_to' => '2025-12-31',
        ]);

        $this->getJson("/api/ownership-interests/{$interest->id}/k1s/2023")
            ->assertNotFound();

        K1Form::create([
            'ownership_interest_id' => $interest->id,
            'tax_year' => 2023,
            'partnership_tax_year_begin' => '2023-01-01',
            'partnership_tax_year_end' => '2023-12-31',
        ]);

        $this->getJson("/api/ownership-interests/{$interest->id}/k1s/2023")
            ->assertForbidden();
    }
}
