<?php

use Illuminate\Support\Facades\Route;

// Home page with company list
Route::get('/', function () {
    return view('welcome');
});

// Company detail view with K-1 forms and ownership interests
Route::get('/company/{id}', function ($id) {
    return view('company', ['id' => $id]);
});

// K-1 Form detail/edit view
Route::get('/company/{companyId}/k1/{formId}', function ($companyId, $formId) {
    return view('k1-form', ['companyId' => $companyId, 'formId' => $formId]);
});

// Ownership Interest detail view (includes outside basis and loss limitations)

Route::get('/ownership/{interestId}', function ($interestId) {

    return view('ownership-interest', ['interestId' => $interestId]);

});



// Ownership Basis Drill-down

Route::get('/ownership/{interestId}/basis/{year}/{type}', function ($interestId, $year, $type) {

    return view('ownership-basis-detail', [

        'interestId' => $interestId,

        'year' => $year,

        'type' => $type

    ]);

})->where('type', 'increases|decreases');
