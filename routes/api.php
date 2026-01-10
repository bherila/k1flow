<?php

use App\Http\Controllers\K1\K1CompanyController;
use App\Http\Controllers\K1\K1FormController;
use App\Http\Controllers\K1\K1IncomeSourceController;
use App\Http\Controllers\K1\OwnershipInterestController;
use App\Http\Controllers\K1\OutsideBasisController;
use App\Http\Controllers\K1\LossLimitationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| K-1 Flow API Routes
|--------------------------------------------------------------------------
*/

// Companies
Route::apiResource('companies', K1CompanyController::class);

// K-1 Forms (nested under companies)
Route::prefix('companies/{company}')->group(function () {
    Route::get('forms', [K1FormController::class, 'index']);
    Route::post('forms', [K1FormController::class, 'store']);
    Route::get('forms/{form}', [K1FormController::class, 'show']);
    Route::put('forms/{form}', [K1FormController::class, 'update']);
    Route::delete('forms/{form}', [K1FormController::class, 'destroy']);
    Route::post('forms/{form}/upload', [K1FormController::class, 'uploadForm']);
    Route::post('forms/{form}/extract-pdf', [K1FormController::class, 'extractFromPdf']);
    
    // Ownership interests for this company (where this company is the owner)
    Route::get('ownership-interests', [OwnershipInterestController::class, 'forCompany']);
    
    // Ownership interests where this company is owned by others
    Route::get('owned-by', [OwnershipInterestController::class, 'ownedByCompany']);
});

// K-1 Form sub-resources (using form ID directly for cleaner URLs)
Route::prefix('forms/{form}')->group(function () {
    // Income Sources
    Route::get('income-sources', [K1IncomeSourceController::class, 'index']);
    Route::post('income-sources', [K1IncomeSourceController::class, 'store']);
    Route::put('income-sources/{source}', [K1IncomeSourceController::class, 'update']);
    Route::delete('income-sources/{source}', [K1IncomeSourceController::class, 'destroy']);
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
});

// Adjustment and carryforward updates/deletes (don't need ownership context)
Route::put('adjustments/{adjustment}', [OutsideBasisController::class, 'updateAdjustment']);
Route::delete('adjustments/{adjustment}', [OutsideBasisController::class, 'destroyAdjustment']);
Route::put('carryforwards/{carryforward}', [LossLimitationController::class, 'updateCarryforward']);
Route::delete('carryforwards/{carryforward}', [LossLimitationController::class, 'destroyCarryforward']);
