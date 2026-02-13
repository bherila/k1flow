<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Auth\UserSettingsController;
use App\Http\Controllers\Admin\AdminUserController;
use Illuminate\Support\Facades\Route;

// Authentication Routes
Route::get('/sign-in', [AuthController::class, 'showSignIn'])->name('sign-in')->middleware('guest');
// Also expose a conventional `/login` route name so `auth` middleware redirects work
Route::get('/login', function () {
    return redirect()->route('sign-in');
})->name('login');
Route::post('/sign-in', [AuthController::class, 'signIn'])->middleware('guest');
Route::get('/sign-up', [AuthController::class, 'showSignUp'])->name('sign-up')->middleware('guest');
Route::post('/sign-up', [AuthController::class, 'signUp'])->middleware('guest');
Route::post('/sign-out', [AuthController::class, 'signOut'])->name('sign-out')->middleware('auth');

// Password Reset Routes
Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink'])->name('password.email')->middleware('guest');
Route::get('/reset-password/{token}', [PasswordResetController::class, 'showResetForm'])->name('password.reset')->middleware('guest');
Route::post('/reset-password', [PasswordResetController::class, 'reset'])->name('password.update')->middleware('guest');

// Email Verification Routes
Route::get('/email/verify', [EmailVerificationController::class, 'notice'])->middleware('auth')->name('verification.notice');
Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])->middleware(['auth', 'signed'])->name('verification.verify');
Route::post('/email/verification-notification', [EmailVerificationController::class, 'resend'])->middleware(['auth', 'throttle:6,1'])->name('verification.send');

// User Settings Routes
Route::middleware('auth')->group(function () {
    Route::get('/user/settings', [UserSettingsController::class, 'show'])->name('settings');
    Route::post('/user/settings/profile', [UserSettingsController::class, 'updateProfile'])->name('settings.profile');
    Route::post('/user/settings/password', [UserSettingsController::class, 'updatePassword'])->name('settings.password');
    Route::post('/user/settings/email', [UserSettingsController::class, 'requestEmailChange'])->name('settings.email');
    Route::get('/user/settings/confirm-email', [UserSettingsController::class, 'confirmEmailChange'])->name('settings.confirm-email');
});

// Admin Routes
Route::middleware(['auth'])->prefix('admin')->group(function () {
    Route::get('/users', [AdminUserController::class, 'index'])->name('admin.users');
    Route::get('/user/{user}', [AdminUserController::class, 'edit'])->name('admin.user.edit');
});

// Home page with welcome message (redirects to companies if logged in)
Route::get('/', function () {
    if (auth()->check()) {
        return redirect('/companies');
    }
    return view('welcome-new');
});

// Companies list page (requires auth)
Route::middleware('auth')->get('/companies', function () {
    return view('companies');
});

// Company detail view with K-1 forms and ownership interests
Route::get('/company/{id}', function ($id) {
    $company = \App\Models\K1\K1Company::findOrFail($id);
    return view('company', ['id' => $id, 'companyName' => $company->name]);
});

// K-1 Form detail/edit view
Route::get('/ownership/{interestId}/k1/{formId}', function ($interestId, $formId) {
    $form = \App\Models\K1\K1Form::with('ownershipInterest.ownedCompany')->findOrFail($formId);
    $companyName = $form->ownershipInterest && $form->ownershipInterest->ownedCompany ? $form->ownershipInterest->ownedCompany->name : null;
    $formYear = $form->tax_year ?? null;
    return view('k1-form', ['interestId' => $interestId, 'formId' => $formId, 'companyName' => $companyName, 'formYear' => $formYear]);
});

// K-1 Streamlined multi-year view
Route::get('/ownership/{interestId}/k1-streamlined', function ($interestId) {
    $interest = \App\Models\K1\OwnershipInterest::with('ownedCompany')->findOrFail($interestId);
    $companyName = $interest->ownedCompany?->name ?? null;
    return view('k1-form-streamlined', ['interestId' => $interestId, 'companyName' => $companyName]);
});

// Ownership Interest detail view (includes outside basis and loss limitations)
Route::get('/ownership/{interestId}', function ($interestId) {
    $interest = \App\Models\K1\OwnershipInterest::with(['ownedCompany','ownerCompany'])->findOrFail($interestId);
    $ownedCompanyName = $interest->ownedCompany?->name ?? null;
    $ownerCompanyName = $interest->ownerCompany?->name ?? null;

    return view('ownership-interest', ['interestId' => $interestId, 'ownedCompanyName' => $ownedCompanyName, 'ownerCompanyName' => $ownerCompanyName]);
});



// Ownership Basis Adjustments (Merged Increases/Decreases)
Route::get('/ownership/{interestId}/basis/{year}/adjustments', function ($interestId, $year) {
    $interest = \App\Models\K1\OwnershipInterest::with('ownedCompany')->findOrFail($interestId);
    $ownedCompanyName = $interest->ownedCompany?->name ?? null;

    return view('ownership-basis-detail', [
        'interestId' => $interestId,
        'year' => $year,
        'ownedCompanyName' => $ownedCompanyName,
    ]);
});



Route::get('/ownership/{interestId}/at-risk/{year}', function ($interestId, $year) {
    $interest = \App\Models\K1\OwnershipInterest::with('ownedCompany')->findOrFail($interestId);
    $ownedCompanyName = $interest->ownedCompany?->name ?? null;

    return view('loss-limitation-detail', [
        'interestId' => $interestId,
        'year' => $year,
        'type' => 'at-risk',
        'ownedCompanyName' => $ownedCompanyName,
    ]);
});



Route::get('/ownership/{interestId}/passive-activity-loss/{year}', function ($interestId, $year) {
    $interest = \App\Models\K1\OwnershipInterest::with('ownedCompany')->findOrFail($interestId);
    $ownedCompanyName = $interest->ownedCompany?->name ?? null;

    return view('loss-limitation-detail', [
        'interestId' => $interestId,
        'year' => $year,
        'type' => 'passive-activity',
        'ownedCompanyName' => $ownedCompanyName,
    ]);
});



Route::get('/ownership/{interestId}/excess-business-loss/{year}', function ($interestId, $year) {
    $interest = \App\Models\K1\OwnershipInterest::with('ownedCompany')->findOrFail($interestId);
    $ownedCompanyName = $interest->ownedCompany?->name ?? null;

    return view('loss-limitation-detail', [
        'interestId' => $interestId,
        'year' => $year,
        'type' => 'excess-business-loss',
        'ownedCompanyName' => $ownedCompanyName,
    ]);
});



Route::get('/ownership/{interestId}/net-operating-loss/{year}', function ($interestId, $year) {
    $interest = \App\Models\K1\OwnershipInterest::with('ownedCompany')->findOrFail($interestId);
    $ownedCompanyName = $interest->ownedCompany?->name ?? null;

    return view('loss-limitation-detail', [
        'interestId' => $interestId,
        'year' => $year,
        'type' => 'net-operating-loss',
        'ownedCompanyName' => $ownedCompanyName,
    ]);
});


