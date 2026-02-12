<?php

namespace Database\Factories\K1;

use App\Models\K1\OwnershipInterest;
use App\Models\K1\K1Company;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\K1\OwnershipInterest>
 */
class OwnershipInterestFactory extends Factory
{
    protected $model = OwnershipInterest::class;

    public function definition(): array
    {
        $inceptionYear = fake()->numberBetween(2015, 2023);
        
        return [
            'owner_company_id' => K1Company::factory(),
            'owned_company_id' => K1Company::factory(),
            'ownership_percentage' => fake()->randomFloat(2, 0.01, 100),
            'effective_from' => fake()->date(),
            'effective_to' => null,
            'ownership_class' => fake()->optional()->randomElement(['Class A', 'Class B', 'Common']),
            'inception_date' => "{$inceptionYear}-01-01",
            'inception_basis_year' => $inceptionYear,
            'method_of_acquisition' => fake()->randomElement(['purchase', 'contribution', 'gift', 'inheritance']),
            'contributed_cash_property' => fake()->randomFloat(2, 0, 100000),
            'purchase_price' => fake()->randomFloat(2, 0, 100000),
            'gift_inheritance' => fake()->randomFloat(2, 0, 100000),
            'taxable_compensation' => fake()->randomFloat(2, 0, 100000),
            'inception_basis_total' => fake()->randomFloat(2, 0, 500000),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
