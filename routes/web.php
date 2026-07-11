<?php

use App\Http\Controllers\AgendaController;
use App\Http\Controllers\ExcelImportController;
use App\Http\Controllers\SlotController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WaitingListController;
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
    Route::resource('waiting-lists', WaitingListController::class);

    Route::post('/waiting-list/import', [ExcelImportController::class, 'import'])
        ->middleware(['auth']);
    Route::get('/waiting-list/import', fn() => Inertia::render('WaitingList/Import'))
        ->middleware(['auth']);

    // admin
    Route::post('/waiting-lists/{waitingList}/admin', [WaitingListController::class, 'updateAdmin']);

    // schedule
    Route::post('/waiting-lists/{waitingList}/schedule', [WaitingListController::class, 'storeSchedule']);
    Route::put('/waiting-lists/{waitingList}/schedule/{schedule}', [WaitingListController::class, 'updateSchedule']);

    Route::resource('slots', SlotController::class);

    Route::get('/agenda', [AgendaController::class, 'index']);
    Route::get('/agenda/semana', [AgendaController::class, 'semana']);
    Route::get('/agenda/mensal', [AgendaController::class, 'mensal']);

    Route::get('/waiting/export', [WaitingListController::class, 'export'])->name('waiting.export');
    Route::put('/waiting-lists/{waitingList}/observacoes-gerais', [WaitingListController::class, 'updateObservacoesGerais']);

    Route::resource('users', UserController::class);

    Route::resource('teams', \App\Http\Controllers\TeamController::class);
});


Route::get('/phpinfo', function () {
    phpinfo();
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
