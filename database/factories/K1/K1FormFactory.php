<?php

namespace Database\Factories\K1;

use App\Models\K1\K1Form;
use App\Models\K1\OwnershipInterest;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\K1\K1Form>
 */
class K1FormFactory extends Factory
{
    protected $model = K1Form::class;

    public function definition(): array
    {
        $taxYear = fake()->numberBetween(2018, 2024);
        
        return [
            'ownership_interest_id' => OwnershipInterest::factory(),
            'tax_year' => $taxYear,
            'partnership_name' => fake()->company(),
            'partnership_ein' => fake()->numerify('##-#######'),
            'partnership_address' => fake()->streetAddress(),
            'partnership_tax_year_begin' => "{$taxYear}-01-01",
            'partnership_tax_year_end' => "{$taxYear}-12-31",
            'is_publicly_traded' => false,
            'partner_name' => fake()->name(),
            'is_general_partner' => fake()->boolean(30),
            'is_limited_partner' => fake()->boolean(70),
            'is_domestic_partner' => fake()->boolean(90),
            'share_of_profit_beginning' => fake()->randomFloat(2, 0, 100),
            'share_of_profit_ending' => fake()->randomFloat(2, 0, 100),
            'share_of_loss_beginning' => fake()->randomFloat(2, 0, 100),
            'share_of_loss_ending' => fake()->randomFloat(2, 0, 100),
            'share_of_capital_beginning' => fake()->randomFloat(2, 0, 100),
            'share_of_capital_ending' => fake()->randomFloat(2, 0, 100),
            'beginning_capital_account' => fake()->randomFloat(2, -50000, 500000),
            'ending_capital_account' => fake()->randomFloat(2, -50000, 500000),
            'box_1_ordinary_income' => fake()->randomFloat(2, -50000, 100000),
            'box_2_net_rental_real_estate' => fake()->randomFloat(2, -20000, 50000),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
