<?php

use Illuminate\Support\Facades\Route;

// Home page with company list
Route::get('/', function () {
    return view('welcome');
});

// Company detail view with K-1 forms
Route::get('/company/{id}', function ($id) {
    return view('company', ['id' => $id]);
});

// K-1 Form detail/edit view
Route::get('/company/{companyId}/k1/{formId}', function ($companyId, $formId) {
    return view('k1-form', ['companyId' => $companyId, 'formId' => $formId]);
});
