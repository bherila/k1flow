<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Moves inception basis fields from outside_basis to ownership_interests table.
     * Inception basis is a one-time value when the interest was acquired, not per-year.
     */
    public function up(): void
    {
        // Add inception basis fields to ownership_interests
        Schema::table('ownership_interests', function (Blueprint $table) {
            $table->integer('inception_basis_year')->nullable()->after('ownership_class');
            $table->decimal('contributed_cash_property', 16, 2)->nullable()->after('inception_basis_year');
            $table->decimal('purchase_price', 16, 2)->nullable()->after('contributed_cash_property');
            $table->decimal('gift_inheritance', 16, 2)->nullable()->after('purchase_price');
            $table->decimal('taxable_compensation', 16, 2)->nullable()->after('gift_inheritance');
            $table->decimal('inception_basis_total', 16, 2)->nullable()->after('taxable_compensation');
        });

        // Remove inception basis fields from outside_basis (they shouldn't be per-year)
        Schema::table('outside_basis', function (Blueprint $table) {
            $table->dropColumn([
                'contributed_cash_property',
                'purchase_price',
                'gift_inheritance',
                'taxable_compensation',
                'inception_basis_total',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Add inception basis fields back to outside_basis
        Schema::table('outside_basis', function (Blueprint $table) {
            $table->decimal('contributed_cash_property', 16, 2)->nullable()->after('tax_year');
            $table->decimal('purchase_price', 16, 2)->nullable()->after('contributed_cash_property');
            $table->decimal('gift_inheritance', 16, 2)->nullable()->after('purchase_price');
            $table->decimal('taxable_compensation', 16, 2)->nullable()->after('gift_inheritance');
            $table->decimal('inception_basis_total', 16, 2)->nullable()->after('taxable_compensation');
        });

        // Remove inception basis fields from ownership_interests
        Schema::table('ownership_interests', function (Blueprint $table) {
            $table->dropColumn([
                'inception_basis_year',
                'contributed_cash_property',
                'purchase_price',
                'gift_inheritance',
                'taxable_compensation',
                'inception_basis_total',
            ]);
        });
    }
};
