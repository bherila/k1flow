<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\DB;

abstract class TestCase extends BaseTestCase
{
    /**
     * Creates the application.
     *
     * Ensures .env.testing is loaded for all tests and SQLite is used.
     */
    public function createApplication()
    {
        // Force load .env.testing BEFORE creating the app
        $envTestingPath = dirname(__DIR__).'/.env.testing';
        if (file_exists($envTestingPath)) {
            $dotenv = \Dotenv\Dotenv::createMutable(dirname(__DIR__), '.env.testing');
            $dotenv->load();
        }

        $app = require __DIR__.'/../bootstrap/app.php';
        $app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

        // Disable Vite in tests
        $app['config']->set('app.asset_url', '');

        return $app;
    }

    /**
     * Boot the testing helper traits.
     *
     * This method is called before each test and ensures we're using SQLite.
     */
    protected function setUpTraits(): array
    {
        // Verify we're using SQLite to prevent accidental MySQL usage
        $this->assertDatabaseIsSqlite();

        return parent::setUpTraits();
    }

    /**
     * Assert that the database connection is SQLite.
     *
     * This is a safety check to ensure tests never accidentally run against
     * the production MySQL database, even if .env credentials are present.
     */
    protected function assertDatabaseIsSqlite(): void
    {
        $connection = config('database.default');
        $driver = config("database.connections.{$connection}.driver");

        if ($driver !== 'sqlite') {
            $this->fail(
                "Tests must run on SQLite database for safety. " .
                "Current connection '{$connection}' uses driver '{$driver}'. " .
                "Check phpunit.xml environment variables or .env.testing file."
            );
        }
    }

    /**
     * Get the current database driver name.
     */
    protected function getDatabaseDriver(): string
    {
        return DB::connection()->getDriverName();
    }
}
