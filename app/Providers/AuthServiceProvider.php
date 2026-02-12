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
    }
}
