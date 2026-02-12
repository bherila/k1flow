<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('acting_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('event_name', [
                'create',
                'update',
                'sign-in',
                'reset-password',
                'reset-password-request',
                'reset-password-complete',
                'email-change-request',
                'email-change-complete',
                'email-verify',
                'sign-out',
                'admin-lock',
                'admin-unlock'
            ]);
            $table->boolean('is_successful')->default(true);
            $table->text('message')->nullable();
            $table->string('ip', 45)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_audit_logs');
    }
};
