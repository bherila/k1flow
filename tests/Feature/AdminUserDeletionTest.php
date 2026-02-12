<?php

namespace Tests\Feature;

use Tests\RefreshDatabaseWithSqliteSchema;
use Tests\TestCase;
use App\Models\User;
use App\Models\K1\K1Company;
use App\Models\K1\OwnershipInterest;
use App\Models\K1\K1Form;
use App\Models\K1\K1IncomeSource;
use App\Models\K1\OutsideBasis;
use App\Models\K1\ObAdjustment;
use App\Models\K1\LossLimitation;
use App\Models\K1\LossCarryforward;
use App\Models\K1\F461Worksheet;

class AdminUserDeletionTest extends TestCase
{
    use RefreshDatabaseWithSqliteSchema;

    protected User $admin;
    protected User $testUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Create admin user
        $this->admin = User::factory()->admin()->create([
            'email' => 'admin@test.com',
        ]);

        // Create test user
        $this->testUser = User::factory()->create([
            'email' => 'test@test.com',
        ]);
    }

    public function test_admin_can_delete_user_and_cascade_soft_delete_all_data(): void
    {
        // Create company owned by test user
        $company = K1Company::factory()->create([
            'owner_user_id' => $this->testUser->id,
            'name' => 'Test Company',
        ]);

        // Create owned company
        $ownedCompany = K1Company::factory()->create([
            'owner_user_id' => $this->testUser->id,
            'name' => 'Owned Company',
        ]);

        // Create ownership interest
        $interest = OwnershipInterest::factory()->create([
            'owner_company_id' => $company->id,
            'owned_company_id' => $ownedCompany->id,
        ]);

        // Create K1 form
        $form = K1Form::factory()->create([
            'ownership_interest_id' => $interest->id,
            'tax_year' => 2023,
        ]);

        // Create income source
        $incomeSource = K1IncomeSource::create([
            'k1_form_id' => $form->id,
            'income_type' => 'passive',
            'description' => 'Test income',
            'amount' => 1000.00,
        ]);

        // Create outside basis
        $basis = OutsideBasis::factory()->create([
            'ownership_interest_id' => $interest->id,
            'tax_year' => 2023,
        ]);

        // Create basis adjustment
        $adjustment = ObAdjustment::create([
            'outside_basis_id' => $basis->id,
            'adjustment_category' => 'increase',
            'adjustment_type_code' => 'cash_contribution',
            'amount' => 5000.00,
        ]);

        // Create loss limitation
        $lossLimit = LossLimitation::create([
            'ownership_interest_id' => $interest->id,
            'tax_year' => 2023,
            'capital_at_risk' => 10000.00,
        ]);

        // Create loss carryforward
        $carryforward = LossCarryforward::create([
            'ownership_interest_id' => $interest->id,
            'origin_year' => 2022,
            'carryforward_type' => 'at_risk',
            'original_amount' => 5000.00,
            'remaining_amount' => 5000.00,
        ]);

        // Create F461 worksheet
        $worksheet = F461Worksheet::create([
            'ownership_interest_id' => $interest->id,
            'tax_year' => 2023,
            'line_2' => 1000.00,
        ]);

        // Delete user via API as admin
        $response = $this->actingAs($this->admin)
            ->deleteJson("/api/admin/users/{$this->testUser->id}");

        $response->assertStatus(200);
        $response->assertJson(['message' => 'User and all related data deleted successfully']);

        // Verify user is soft deleted
        $this->assertSoftDeleted('users', ['id' => $this->testUser->id]);

        // Verify companies are soft deleted
        $this->assertSoftDeleted('k1_companies', ['id' => $company->id]);
        $this->assertSoftDeleted('k1_companies', ['id' => $ownedCompany->id]);

        // Verify ownership interest is soft deleted
        $this->assertSoftDeleted('ownership_interests', ['id' => $interest->id]);

        // Verify K1 form is soft deleted
        $this->assertSoftDeleted('k1_forms', ['id' => $form->id]);

        // Verify income source is soft deleted
        $this->assertSoftDeleted('k1_income_sources', ['id' => $incomeSource->id]);

        // Verify outside basis is soft deleted
        $this->assertSoftDeleted('outside_basis', ['id' => $basis->id]);

        // Verify adjustment is soft deleted
        $this->assertSoftDeleted('ob_adjustments', ['id' => $adjustment->id]);

        // Verify loss limitation is soft deleted
        $this->assertSoftDeleted('loss_limitations', ['id' => $lossLimit->id]);

        // Verify loss carryforward is soft deleted
        $this->assertSoftDeleted('loss_carryforwards', ['id' => $carryforward->id]);

        // Verify F461 worksheet is soft deleted
        $this->assertSoftDeleted('k1_f461_worksheets', ['id' => $worksheet->id]);
    }

    public function test_non_admin_cannot_delete_user(): void
    {
        $response = $this->actingAs($this->testUser)
            ->deleteJson("/api/admin/users/{$this->testUser->id}");

        $response->assertStatus(403);
    }

    public function test_unauthenticated_user_cannot_delete_user(): void
    {
        $response = $this->deleteJson("/api/admin/users/{$this->testUser->id}");

        $response->assertStatus(401);
    }

    public function test_deleted_user_data_can_be_queried_with_trashed(): void
    {
        $company = K1Company::factory()->create([
            'owner_user_id' => $this->testUser->id,
        ]);

        // Delete user
        $this->actingAs($this->admin)
            ->deleteJson("/api/admin/users/{$this->testUser->id}");

        // Verify we can still query with trashed
        $deletedUser = User::withTrashed()->find($this->testUser->id);
        $this->assertNotNull($deletedUser);
        $this->assertNotNull($deletedUser->deleted_at);

        $deletedCompany = K1Company::withTrashed()->find($company->id);
        $this->assertNotNull($deletedCompany);
        $this->assertNotNull($deletedCompany->deleted_at);
    }
}
