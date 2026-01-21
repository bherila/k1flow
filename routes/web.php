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
Route::get('/ownership/{interestId}/k1/{formId}', function ($interestId, $formId) {
    return view('k1-form', ['interestId' => $interestId, 'formId' => $formId]);
});

// Ownership Interest detail view (includes outside basis and loss limitations)

Route::get('/ownership/{interestId}', function ($interestId) {

    return view('ownership-interest', ['interestId' => $interestId]);

});



// Ownership Basis Adjustments (Merged Increases/Decreases)

Route::get('/ownership/{interestId}/basis/{year}/adjustments', function ($interestId, $year) {

    return view('ownership-basis-detail', [

        'interestId' => $interestId,

        'year' => $year,

    ]);

});



Route::get('/ownership/{interestId}/at-risk/{year}', function ($interestId, $year) {

    return view('loss-limitation-detail', [

        'interestId' => $interestId,

        'year' => $year,

        'type' => 'at-risk'

    ]);

});



Route::get('/ownership/{interestId}/passive-activity-loss/{year}', function ($interestId, $year) {

    return view('loss-limitation-detail', [

        'interestId' => $interestId,

        'year' => $year,

        'type' => 'passive-activity'

    ]);

});



Route::get('/ownership/{interestId}/excess-business-loss/{year}', function ($interestId, $year) {

    return view('loss-limitation-detail', [

        'interestId' => $interestId,

        'year' => $year,

        'type' => 'excess-business-loss'

    ]);

});



Route::get('/ownership/{interestId}/net-operating-loss/{year}', function ($interestId, $year) {

    return view('loss-limitation-detail', [

        'interestId' => $interestId,

        'year' => $year,

        'type' => 'net-operating-loss'

    ]);

});


