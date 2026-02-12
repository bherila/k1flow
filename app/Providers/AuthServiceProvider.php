<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Define the admin-only gate
        // User ID 1 is always admin, or if is_admin flag is true
        Gate::define('admin-only', function ($user) {
            return $user->id === 1 || $user->is_admin === true;
        });

        // Define the access-company gate
        // User can access a company if they own it OR have shared access
        Gate::define('access-company', function ($user, $company) {
            // Check cache first to optimize repeated checks
            $cacheKey = "user:{$user->id}:company:{$company->id}:access";
            
            return cache()->remember($cacheKey, 300, function () use ($user, $company) {
                // Owner has access
                if ($company->owner_user_id === $user->id) {
                    return true;
                }

                // Check if user has shared access
                return $company->users()->where('user_id', $user->id)->exists();
            });
        });
    }
}
