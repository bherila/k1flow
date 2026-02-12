<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('user_audit_logs')) {
            return;
        }

                $driver = DB::getDriverName();

                if ($driver === 'mysql') {
                        // Drop existing foreign key, make column nullable, and re-add FK with ON DELETE SET NULL
                        DB::statement('ALTER TABLE `user_audit_logs` DROP FOREIGN KEY `user_audit_logs_user_id_foreign`');
                        DB::statement('ALTER TABLE `user_audit_logs` MODIFY `user_id` BIGINT UNSIGNED NULL');
                        DB::statement('ALTER TABLE `user_audit_logs` ADD CONSTRAINT `user_audit_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL');
                        return;
                }

                if ($driver === 'sqlite') {
                        // SQLite cannot drop foreign keys; rebuild the table with user_id nullable and ON DELETE SET NULL
                        DB::statement('PRAGMA foreign_keys = OFF');

                        DB::statement(<<<'SQL'
CREATE TABLE user_audit_logs_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    acting_user_id INTEGER,
    event_name TEXT CHECK (event_name IN ('create','update','sign-in','reset-password','reset-password-request','reset-password-complete','email-change-request','email-change-complete','email-verify','sign-out','admin-lock','admin-unlock')),
    is_successful INTEGER NOT NULL DEFAULT 1,
    message TEXT,
    ip VARCHAR(45),
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (acting_user_id) REFERENCES users(id) ON DELETE SET NULL
);
SQL
                        );

                        DB::statement('INSERT INTO user_audit_logs_new (id, user_id, acting_user_id, event_name, is_successful, message, ip, created_at, updated_at) SELECT id, user_id, acting_user_id, event_name, is_successful, message, ip, created_at, updated_at FROM user_audit_logs');
                        DB::statement('DROP TABLE user_audit_logs');
                        DB::statement('ALTER TABLE user_audit_logs_new RENAME TO user_audit_logs');

                        DB::statement('PRAGMA foreign_keys = ON');
                        return;
                }

                // For other drivers, attempt a noop change
                throw new \RuntimeException('Unsupported database driver: ' . $driver);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('user_audit_logs')) {
            return;
        }

                $driver = DB::getDriverName();

                if ($driver === 'mysql') {
                        DB::statement('ALTER TABLE `user_audit_logs` DROP FOREIGN KEY `user_audit_logs_user_id_foreign`');
                        DB::statement('ALTER TABLE `user_audit_logs` MODIFY `user_id` BIGINT UNSIGNED NOT NULL');
                        DB::statement('ALTER TABLE `user_audit_logs` ADD CONSTRAINT `user_audit_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT');
                        return;
                }

                if ($driver === 'sqlite') {
                        // For SQLite, reversing is non-trivial if NULL user_id rows exist. We'll attempt to rebuild enforcing NOT NULL and RESTRICT,
                        // but skip rows with NULL user_id to avoid FK violations.
                        DB::statement('PRAGMA foreign_keys = OFF');

                        DB::statement(<<<'SQL'
CREATE TABLE user_audit_logs_old (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    acting_user_id INTEGER,
    event_name TEXT CHECK (event_name IN ('create','update','sign-in','reset-password','reset-password-request','reset-password-complete','email-change-request','email-change-complete','email-verify','sign-out','admin-lock','admin-unlock')),
    is_successful INTEGER NOT NULL DEFAULT 1,
    message TEXT,
    ip VARCHAR(45),
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (acting_user_id) REFERENCES users(id) ON DELETE SET NULL
);
SQL
                        );

                        DB::statement('INSERT INTO user_audit_logs_old (id, user_id, acting_user_id, event_name, is_successful, message, ip, created_at, updated_at) SELECT id, user_id, acting_user_id, event_name, is_successful, message, ip, created_at, updated_at FROM user_audit_logs WHERE user_id IS NOT NULL');
                        DB::statement('DROP TABLE user_audit_logs');
                        DB::statement('ALTER TABLE user_audit_logs_old RENAME TO user_audit_logs');

                        DB::statement('PRAGMA foreign_keys = ON');
                        return;
                }

                throw new \RuntimeException('Unsupported database driver: ' . $driver);
    }
};
