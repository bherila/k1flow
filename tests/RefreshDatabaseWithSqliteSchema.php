<?php

namespace Tests;

use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * Trait for tests that need a fresh database with the SQLite schema.
 *
 * This trait extends Laravel's RefreshDatabase to explicitly load the SQLite
 * schema file, ensuring tests never accidentally use MySQL.
 *
 * Usage:
 *   use Tests\RefreshDatabaseWithSqliteSchema;
 *
 *   class MyTest extends TestCase
 *   {
 *       use RefreshDatabaseWithSqliteSchema;
 *       // ...
 *   }
 */
trait RefreshDatabaseWithSqliteSchema
{
    use RefreshDatabase;

    /**
     * Determine if the seed should run when refreshing the database.
     */
    protected function shouldSeed(): bool
    {
        return false;
    }

    /**
     * Refresh the in-memory database.
     *
     * This method is called by RefreshDatabase when using in-memory SQLite.
     * We override it to load our custom SQLite schema.
     */
    protected function refreshInMemoryDatabase(): void
    {
        // Verify we're using SQLite
        $driver = config('database.connections.' . config('database.default') . '.driver');
        if ($driver !== 'sqlite') {
            $this->fail(
                "RefreshDatabaseWithSqliteSchema requires SQLite. " .
                "Current driver: {$driver}"
            );
        }

        // Load the SQLite schema directly
        $schemaPath = database_path('schema/sqlite-schema.sql');

        if (!file_exists($schemaPath)) {
            $this->fail(
                "SQLite schema file not found at: {$schemaPath}. " .
                "Run 'php artisan schema:dump --database=sqlite' or create it manually."
            );
        }

        $schema = file_get_contents($schemaPath);

        // SQLite doesn't support multiple statements in a single exec,
        // so we need to split and execute each statement separately
        $statements = $this->splitSqlStatements($schema);

        foreach ($statements as $statement) {
            $statement = trim($statement);
            if (!empty($statement) && !$this->isComment($statement)) {
                \DB::unprepared($statement);
            }
        }
    }

    /**
     * Split SQL into individual statements.
     */
    protected function splitSqlStatements(string $sql): array
    {
        // Remove multi-line comments
        $sql = preg_replace('/\/\*.*?\*\//s', '', $sql);

        // Split on semicolons, but be careful with statements that might have semicolons in strings
        $statements = [];
        $current = '';

        foreach (explode("\n", $sql) as $line) {
            $line = trim($line);

            // Skip empty lines and single-line comments
            if (empty($line) || str_starts_with($line, '--')) {
                continue;
            }

            $current .= ' ' . $line;

            // If line ends with semicolon, it's a complete statement
            if (str_ends_with($line, ';')) {
                $statements[] = trim($current);
                $current = '';
            }
        }

        // Add any remaining statement
        if (!empty(trim($current))) {
            $statements[] = trim($current);
        }

        return $statements;
    }

    /**
     * Check if a string is just a SQL comment.
     */
    protected function isComment(string $statement): bool
    {
        $statement = trim($statement);
        return str_starts_with($statement, '--') || str_starts_with($statement, '/*');
    }
}
