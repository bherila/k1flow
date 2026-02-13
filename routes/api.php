<?php

use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\K1\K1CompanyController;
use App\Http\Controllers\K1\K1FormController;
use App\Http\Controllers\K1\K1IncomeSourceController;
use App\Http\Controllers\K1\OwnershipInterestController;
use App\Http\Controllers\K1\OutsideBasisController;
use App\Http\Controllers\K1\LossLimitationController;
use App\Http\Controllers\K1\F461WorksheetController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| K-1 Flow API Routes
|--------------------------------------------------------------------------
*/

// Admin User Management API Routes (protected by admin-only gate)
Route::middleware(['auth'])->prefix('admin')->group(function () {
    Route::get('/users', [AdminUserController::class, 'list']);
    Route::get('/users/{user}', [AdminUserController::class, 'show']);
    Route::post('/users', [AdminUserController::class, 'store']);
    Route::put('/users/{user}', [AdminUserController::class, 'update']);
    Route::delete('/users/{user}', [AdminUserController::class, 'destroy']);
    Route::get('/users/{user}/audit-log', [AdminUserController::class, 'auditLog']);
    Route::get('/users/{user}/companies', [AdminUserController::class, 'userCompanies']);
});

// User search (for autocomplete in access control)
Route::middleware(['auth'])->group(function () {
    Route::get('/users/search', [UserController::class, 'search']);
});

// Companies (require auth)
Route::middleware(['auth'])->group(function () {
    Route::apiResource('companies', K1CompanyController::class);
    
    // Company user management
    Route::get('/companies/{company}/users', [K1CompanyController::class, 'listUsers']);
    Route::post('/companies/{company}/users', [K1CompanyController::class, 'grantAccess']);
    Route::delete('/companies/{company}/users/{user}', [K1CompanyController::class, 'revokeAccess']);
});

// K-1 Forms (nested under ownership interests)
Route::prefix('ownership-interests/{interest}')->group(function () {
    Route::get('k1s', [K1FormController::class, 'index']);
    Route::post('k1s', [K1FormController::class, 'store']);
    Route::get('k1s/{taxYear}', [K1FormController::class, 'show'])->whereNumber('taxYear');
    Route::delete('k1s/{taxYear}', [K1FormController::class, 'destroy'])->whereNumber('taxYear');
    Route::post('k1s/{taxYear}/upload', [K1FormController::class, 'uploadForm'])->whereNumber('taxYear');
    Route::post('k1s/{taxYear}/extract-pdf', [K1FormController::class, 'extractFromPdf'])->whereNumber('taxYear');

    // Income Sources
    Route::get('k1s/{taxYear}/income-sources', [K1IncomeSourceController::class, 'index'])->whereNumber('taxYear');
    Route::post('k1s/{taxYear}/income-sources', [K1IncomeSourceController::class, 'store'])->whereNumber('taxYear');
    Route::put('k1s/{taxYear}/income-sources/{source}', [K1IncomeSourceController::class, 'update'])->whereNumber('taxYear');
    Route::delete('k1s/{taxYear}/income-sources/{source}', [K1IncomeSourceController::class, 'destroy'])->whereNumber('taxYear');
});

// Ownership interests for this company (where this company is the owner)
Route::prefix('companies/{company}')->group(function () {
    Route::get('ownership-interests', [OwnershipInterestController::class, 'forCompany']);
    
    // Ownership interests where this company is owned by others
    Route::get('owned-by', [OwnershipInterestController::class, 'ownedByCompany']);
});

// Adjustment type options for UI dropdowns
Route::get('adjustment-types', [OutsideBasisController::class, 'adjustmentTypes']);

// Ownership Interests
Route::prefix('ownership-interests')->group(function () {
    Route::get('/', [OwnershipInterestController::class, 'index']);
    Route::post('/', [OwnershipInterestController::class, 'store']);
    Route::get('{interest}', [OwnershipInterestController::class, 'show']);
    Route::put('{interest}', [OwnershipInterestController::class, 'update']);
    Route::delete('{interest}', [OwnershipInterestController::class, 'destroy']);
    
    // Basis Walk - full multi-year view
    Route::get('{interest}/basis-walk', [OutsideBasisController::class, 'basisWalk']);
    
    // Outside Basis (per ownership interest, per tax year)
    Route::get('{interest}/basis/{taxYear}', [OutsideBasisController::class, 'show']);
    Route::put('{interest}/basis/{taxYear}', [OutsideBasisController::class, 'update']);
    Route::post('{interest}/basis/{taxYear}/adjustments', [OutsideBasisController::class, 'storeAdjustment']);
    
    // Loss Limitations (per ownership interest, per tax year)
    Route::get('{interest}/losses/{taxYear}', [LossLimitationController::class, 'show']);
    Route::put('{interest}/losses/{taxYear}', [LossLimitationController::class, 'update']);
    
    // Loss Carryforwards (across all years for an ownership interest)
    Route::get('{interest}/carryforwards', [LossLimitationController::class, 'carryforwards']);
    Route::post('{interest}/carryforwards', [LossLimitationController::class, 'storeCarryforward']);

    // Form 461 Worksheet
    Route::get('{interest}/f461/{taxYear}', [F461WorksheetController::class, 'show']);
    Route::put('{interest}/f461/{taxYear}', [F461WorksheetController::class, 'update']);
});

// Adjustment and carryforward updates/deletes (don't need ownership context)
Route::put('adjustments/{adjustment}', [OutsideBasisController::class, 'updateAdjustment']);
Route::delete('adjustments/{adjustment}', [OutsideBasisController::class, 'destroyAdjustment']);
Route::put('carryforwards/{carryforward}', [LossLimitationController::class, 'updateCarryforward']);
Route::delete('carryforwards/{carryforward}', [LossLimitationController::class, 'destroyCarryforward']);
