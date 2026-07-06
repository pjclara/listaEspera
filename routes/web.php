<?php

use App\Http\Controllers\ExcelImportController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Waiting List Routes
    Route::resource('waiting-lists', \App\Http\Controllers\WaitingListController::class);

    Route::post('/waiting-list/import', [ExcelImportController::class, 'import'])
        ->middleware(['auth']);
    Route::get('/waiting-list/import', fn() => Inertia::render('WaitingList/Import'))
        ->middleware(['auth']);
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
