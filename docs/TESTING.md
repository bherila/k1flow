# Testing Guide for K1 Flow

This document provides comprehensive guidance for writing and running tests in the K1 Flow project.

## Overview

K1 Flow uses PHPUnit for backend (PHP/Laravel) testing and Jest for frontend (TypeScript/React) testing.

**Important**: All PHPUnit tests run against an **in-memory SQLite database** to ensure:
1. Tests never accidentally modify the production MySQL database
2. Tests are fast (no disk I/O for database operations)
3. Tests are isolated (each test starts with a fresh database)

## Prerequisites

Before running tests, ensure the `.env.testing` file exists in the project root. This file is **required** for tests to use SQLite instead of MySQL.

If `.env.testing` doesn't exist, create it with:

```bash
cp .env .env.testing
```

Then edit `.env.testing` to contain:

```env
APP_ENV=testing
DB_CONNECTION=sqlite
DB_DATABASE=:memory:

# Clear MySQL settings
DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=

# Use test-safe drivers
CACHE_STORE=array
SESSION_DRIVER=array
QUEUE_CONNECTION=sync
MAIL_MAILER=array
```

## Running Tests

### PHPUnit (Backend)

```bash
# Run all tests
composer test

# Or directly with PHPUnit
./vendor/bin/phpunit

# Run a specific test file
./vendor/bin/phpunit tests/Feature/OutsideBasisTest.php

# Run a specific test method
./vendor/bin/phpunit --filter test_basis_walk_calculation_flow

# Run with verbose output
./vendor/bin/phpunit -v

# Run only unit tests
./vendor/bin/phpunit --testsuite Unit

# Run only feature tests
./vendor/bin/phpunit --testsuite Feature
```

### Jest (Frontend)

```bash
# Run all TypeScript tests
pnpm test

# Run in watch mode
pnpm test -- --watch

# Run a specific test file
pnpm test -- tests-ts/DateHelper.test.ts
```

## Database Safety

### How SQLite is Enforced

The project uses multiple layers of protection to ensure tests never touch MySQL:

1. **phpunit.xml**: Sets environment variables:
   ```xml
   <env name="DB_CONNECTION" value="sqlite"/>
   <env name="DB_DATABASE" value=":memory:"/>
   ```

2. **TestCase base class**: Validates the database driver before each test:
   ```php
   protected function assertDatabaseIsSqlite(): void
   {
       $driver = config("database.connections.{$connection}.driver");
       if ($driver !== 'sqlite') {
           $this->fail("Tests must run on SQLite database...");
       }
   }
   ```

3. **RefreshDatabaseWithSqliteSchema trait**: Explicitly loads the SQLite schema and verifies the connection.

### Schema Files

The project maintains two schema files:

- `database/schema/mysql-schema.sql` - Production MySQL schema (exported from production)
- `database/schema/sqlite-schema.sql` - SQLite-compatible schema for testing

When the database schema changes:
1. Update the MySQL schema in production
2. Export it: `mysqldump --no-data k1flow > database/schema/mysql-schema.sql`
3. Update the SQLite schema to match (manually convert MySQL syntax to SQLite)

## Writing Tests

### Test File Structure

```
tests/
├── Feature/           # Integration tests (HTTP requests, database)
│   ├── ExampleTest.php
│   └── OutsideBasisTest.php
├── Unit/              # Unit tests (isolated, no database)
│   └── ExampleTest.php
├── RefreshDatabaseWithSqliteSchema.php  # Custom trait for database tests
└── TestCase.php       # Base test class
```

### Writing a Feature Test (with Database)

```php
<?php

namespace Tests\Feature;

use App\Models\K1\K1Company;
use App\Models\K1\OwnershipInterest;
use Tests\RefreshDatabaseWithSqliteSchema;
use Tests\TestCase;

class MyFeatureTest extends TestCase
{
    use RefreshDatabaseWithSqliteSchema;  // Use this for database tests

    public function test_can_create_company(): void
    {
        $company = K1Company::create(['name' => 'Test Corp']);

        $this->assertDatabaseHas('k1_companies', [
            'name' => 'Test Corp',
        ]);
    }

    public function test_api_returns_companies(): void
    {
        K1Company::create(['name' => 'Test Corp']);

        $response = $this->getJson('/api/companies');

        $response->assertOk()
            ->assertJsonFragment(['name' => 'Test Corp']);
    }
}
```

### Writing a Unit Test (no Database)

```php
<?php

namespace Tests\Unit;

use Tests\TestCase;

class CalculationTest extends TestCase
{
    // No RefreshDatabase trait - these tests don't use the database

    public function test_percentage_calculation(): void
    {
        $result = 100 * 0.25;
        $this->assertEquals(25, $result);
    }
}
```

### Testing API Endpoints

```php
public function test_create_adjustment(): void
{
    // Setup
    $company = K1Company::create(['name' => 'Test Corp']);
    $interest = OwnershipInterest::create([
        'owned_company_id' => $company->id,
        'ownership_percentage' => 0.50,
        'inception_basis_year' => 2023,
        'inception_basis_total' => 1000.00,
    ]);

    // Action
    $response = $this->postJson(
        "/api/ownership-interests/{$interest->id}/basis/2023/adjustments",
        [
            'adjustment_category' => 'increase',
            'amount' => 500,
            'description' => 'Income',
        ]
    );

    // Assert
    $response->assertCreated();
    $this->assertDatabaseHas('ob_adjustments', [
        'adjustment_category' => 'increase',
        'amount' => 500,
    ]);
}
```

### Testing JSON Responses

```php
public function test_basis_calculation(): void
{
    // ... setup code ...

    $response = $this->getJson("/api/ownership-interests/{$interest->id}/basis/2023");

    $response->assertOk()
        ->assertJson([
            'starting_basis' => 1000.00,
            'total_increases' => 500.00,
            'total_decreases' => 200.00,
            'ending_basis' => 1300.00,
        ]);
}
```

## Common Patterns

### Creating Test Data

Use model factories or direct creation:

```php
// Direct creation
$company = K1Company::create(['name' => 'Test Corp']);

// With relationships
$owner = K1Company::create(['name' => 'Owner Corp']);
$owned = K1Company::create(['name' => 'Owned LLC']);
$interest = OwnershipInterest::create([
    'owner_company_id' => $owner->id,
    'owned_company_id' => $owned->id,
    'ownership_percentage' => 0.50,
]);
```

### Testing Validation Errors

```php
public function test_company_name_required(): void
{
    $response = $this->postJson('/api/companies', [
        'name' => '',  // Empty name
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['name']);
}
```

### Testing Relationships

```php
public function test_company_has_forms(): void
{
    $company = K1Company::create(['name' => 'Test Corp']);
    K1Form::create([
        'company_id' => $company->id,
        'tax_year' => 2023,
    ]);

    $this->assertCount(1, $company->k1Forms);
}
```

## Troubleshooting

### "Tests must run on SQLite database" Error

This error means the test is trying to use a non-SQLite database. Check:

1. You're running tests with `./vendor/bin/phpunit` (not `php artisan test` which may use different config)
2. Your `phpunit.xml` has the correct environment variables
3. No `.env.testing` file is overriding the database connection

### "SQLite schema file not found" Error

The `database/schema/sqlite-schema.sql` file is missing. This file should be in version control.

### Schema Mismatch Errors

If you get errors about missing tables or columns:

1. Check if the MySQL schema has been updated
2. Update `database/schema/sqlite-schema.sql` to match
3. Key syntax differences:
   - MySQL `AUTO_INCREMENT` → SQLite `AUTOINCREMENT`
   - MySQL `ENUM` → SQLite `TEXT CHECK (...)`
   - MySQL `TINYINT(1)` → SQLite `INTEGER`

### Foreign Key Errors

SQLite enforces foreign keys. If you get constraint errors:

1. Create parent records before child records
2. Delete child records before parent records
3. Check the `ON DELETE CASCADE` settings in the schema

## Best Practices

1. **Use RefreshDatabaseWithSqliteSchema** for any test that needs database access
2. **Don't use RefreshDatabase directly** - use our custom trait instead
3. **Keep unit tests fast** by not using the database when possible
4. **Test one thing per method** - use descriptive method names
5. **Clean up after yourself** - the trait handles this, but be aware of side effects
6. **Use assertJson for partial matches** - don't assert the entire response structure
7. **Test edge cases** - zero values, null values, boundary conditions

## Continuous Integration

Tests run automatically on push via GitHub Actions. See `.github/workflows/deploy.yml` for the CI configuration.

The CI environment:
- Uses `composer test` to run PHPUnit
- Uses `pnpm test` to run Jest
- Always runs against SQLite (enforced by phpunit.xml)
