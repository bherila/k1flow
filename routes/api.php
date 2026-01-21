<?php

use App\Http\Controllers\K1\K1CompanyController;
use App\Http\Controllers\K1\K1FormController;
use App\Http\Controllers\K1\K1IncomeSourceController;
use App\Http\Controllers\K1\OwnershipInterestController;
use App\Http\Controllers\K1\OutsideBasisController;
use App\Http\Controllers\K1\LossLimitationController;
use App\Http\Controllers\K1\F461WorksheetController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| K-1 Flow API Routes
|--------------------------------------------------------------------------
*/

// Companies
Route::apiResource('companies', K1CompanyController::class);

// K-1 Forms (nested under ownership interests)
Route::prefix('ownership-interests/{interest}')->group(function () {
    Route::get('k1s', [K1FormController::class, 'index']);
    Route::post('k1s', [K1FormController::class, 'store']);
    // Retrieve by year or ID? 
    // Standard ID retrieval is often easier for edit pages if we have the ID. 
    // But we might want retrieval by year.
    // Let's keep ID retrieval at top level or nested?
    // The previous code had `forms/{form}` separate.
});

// K-1 Form operations requiring specific form context
Route::prefix('forms/{form}')->group(function () {
    Route::get('/', [K1FormController::class, 'show']);
    Route::put('/', [K1FormController::class, 'update']);
    Route::delete('/', [K1FormController::class, 'destroy']);
    Route::post('upload', [K1FormController::class, 'uploadForm']);
    Route::post('extract-pdf', [K1FormController::class, 'extractFromPdf']);

    // Income Sources
    Route::get('income-sources', [K1IncomeSourceController::class, 'index']);
    Route::post('income-sources', [K1IncomeSourceController::class, 'store']);
    Route::put('income-sources/{source}', [K1IncomeSourceController::class, 'update']);
    Route::delete('income-sources/{source}', [K1IncomeSourceController::class, 'destroy']);
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
