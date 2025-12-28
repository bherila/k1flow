<?php

use App\Http\Controllers\K1\K1CompanyController;
use App\Http\Controllers\K1\K1FormController;
use App\Http\Controllers\K1\K1IncomeSourceController;
use App\Http\Controllers\K1\K1LossCarryforwardController;
use App\Http\Controllers\K1\K1LossLimitationController;
use App\Http\Controllers\K1\K1OutsideBasisController;
use App\Http\Controllers\K1\K1OwnershipController;
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
});

// K-1 Form sub-resources (using form ID directly for cleaner URLs)
Route::prefix('forms/{form}')->group(function () {
    // Income Sources
    Route::get('income-sources', [K1IncomeSourceController::class, 'index']);
    Route::post('income-sources', [K1IncomeSourceController::class, 'store']);
    Route::put('income-sources/{source}', [K1IncomeSourceController::class, 'update']);
    Route::delete('income-sources/{source}', [K1IncomeSourceController::class, 'destroy']);

    // Outside Basis
    Route::get('outside-basis', [K1OutsideBasisController::class, 'show']);
    Route::put('outside-basis', [K1OutsideBasisController::class, 'update']);
    Route::post('outside-basis/adjustments', [K1OutsideBasisController::class, 'storeAdjustment']);
    Route::put('outside-basis/adjustments/{adjustment}', [K1OutsideBasisController::class, 'updateAdjustment']);
    Route::delete('outside-basis/adjustments/{adjustment}', [K1OutsideBasisController::class, 'destroyAdjustment']);

    // Loss Limitations
    Route::get('loss-limitations', [K1LossLimitationController::class, 'show']);
    Route::put('loss-limitations', [K1LossLimitationController::class, 'update']);

    // Loss Carryforwards
    Route::get('loss-carryforwards', [K1LossCarryforwardController::class, 'index']);
    Route::post('loss-carryforwards', [K1LossCarryforwardController::class, 'store']);
    Route::put('loss-carryforwards/{carryforward}', [K1LossCarryforwardController::class, 'update']);
    Route::delete('loss-carryforwards/{carryforward}', [K1LossCarryforwardController::class, 'destroy']);
});

// Ownership relationships
Route::get('ownership', [K1OwnershipController::class, 'index']);
Route::post('ownership', [K1OwnershipController::class, 'store']);
Route::put('ownership/{ownership}', [K1OwnershipController::class, 'update']);
Route::delete('ownership/{ownership}', [K1OwnershipController::class, 'destroy']);
Route::get('companies/{company}/owners', [K1OwnershipController::class, 'owners']);
Route::get('companies/{company}/owned', [K1OwnershipController::class, 'ownedCompanies']);
