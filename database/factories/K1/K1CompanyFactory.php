<?php

namespace Database\Factories\K1;

use App\Models\K1\K1Company;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\K1\K1Company>
 */
class K1CompanyFactory extends Factory
{
    protected $model = K1Company::class;

    public function definition(): array
    {
        return [
            'owner_user_id' => User::factory(),
            'name' => fake()->company(),
            'ein' => fake()->numerify('##-#######'),
            'entity_type' => fake()->randomElement(['Partnership', 'S-Corp', 'LLC']),
            'address' => fake()->streetAddress(),
            'city' => fake()->city(),
            'state' => fake()->stateAbbr(),
            'zip' => fake()->postcode(),
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
