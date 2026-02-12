<?php

namespace Database\Factories\K1;

use App\Models\K1\OutsideBasis;
use App\Models\K1\OwnershipInterest;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\K1\OutsideBasis>
 */
class OutsideBasisFactory extends Factory
{
    protected $model = OutsideBasis::class;

    public function definition(): array
    {
        $beginningOb = fake()->randomFloat(2, 0, 500000);
        $endingOb = fake()->randomFloat(2, 0, 500000);
        
        return [
            'ownership_interest_id' => OwnershipInterest::factory(),
            'tax_year' => fake()->numberBetween(2018, 2024),
            'beginning_ob' => $beginningOb,
            'ending_ob' => $endingOb,
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
