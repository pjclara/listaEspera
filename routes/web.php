<?php

use App\Http\Controllers\AgendaController;
use App\Http\Controllers\ExcelImportController;
use App\Http\Controllers\RolePermissionController;
use App\Http\Controllers\SlotController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WaitingListCallController;
use App\Http\Controllers\WaitingListController;
use App\Models\WaitingListCall;
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
    Route::resource('waiting-lists', WaitingListController::class)
        ->middleware('permission:waiting_list.view');

    Route::post('/waiting-list/import', [ExcelImportController::class, 'import'])
        ->middleware('permission:waiting_list.import');
    Route::get('/waiting-list/import', fn() => Inertia::render('WaitingList/Import'))
        ->middleware('permission:waiting_list.import');

    // admin
    Route::post('/waiting-lists/{waitingList}/admin', [WaitingListController::class, 'updateAdmin'])
        ->middleware('permission:waiting_list.manage');

    // schedule
    Route::post('/waiting-lists/{waitingList}/schedule', [WaitingListController::class, 'storeSchedule'])
        ->middleware('permission:schedules.create');
    Route::put('/waiting-lists/{waitingList}/schedule/{schedule}', [WaitingListController::class, 'updateSchedule'])
        ->middleware('permission:schedules.edit');

    Route::resource('slots', SlotController::class)
        ->middleware('permission:slots.view');

    Route::get('/agenda', [AgendaController::class, 'index'])->middleware('permission:agenda.view');
    Route::get('/agenda/semana', [AgendaController::class, 'semana'])->middleware('permission:agenda.view');
    Route::get('/agenda/mensal', [AgendaController::class, 'mensal'])->middleware('permission:agenda.view');
    Route::get('/agenda/export/pdf', [AgendaController::class, 'exportPdf'])
        ->middleware('permission:agenda.export')
        ->name('agenda.export.pdf');

    Route::get('/waiting/export', [WaitingListController::class, 'export'])
        ->middleware('permission:waiting_list.export')
        ->name('waiting.export');
    Route::put('/waiting-lists/{waitingList}/observacoes-gerais', [WaitingListController::class, 'updateObservacoesGerais'])
        ->middleware('permission:waiting_list.manage');

    Route::resource('users', UserController::class)
        ->only(['index', 'show'])
        ->middleware('permission:users.view');
    Route::resource('users', UserController::class)
        ->except(['index', 'show'])
        ->middleware('permission:users.manage');

    Route::resource('teams', \App\Http\Controllers\TeamController::class)
        ->only(['index', 'show'])
        ->middleware('permission:teams.view');
    Route::resource('teams', \App\Http\Controllers\TeamController::class)
        ->except(['index', 'show'])
        ->middleware('permission:teams.manage');

    // Gestão de RBAC (roles & permissions)
    Route::get('/access-control', [RolePermissionController::class, 'index'])
        ->middleware('permission:users.manage');

    Route::post('/access-control/roles', [RolePermissionController::class, 'storeRole'])
        ->middleware('permission:users.manage');
    Route::put('/access-control/roles/{role}', [RolePermissionController::class, 'updateRole'])
        ->middleware('permission:users.manage');
    Route::delete('/access-control/roles/{role}', [RolePermissionController::class, 'destroyRole'])
        ->middleware('permission:users.manage');

    Route::post('/access-control/permissions', [RolePermissionController::class, 'storePermission'])
        ->middleware('permission:users.manage');
    Route::put('/access-control/permissions/{permission}', [RolePermissionController::class, 'updatePermission'])
        ->middleware('permission:users.manage');
    Route::delete('/access-control/permissions/{permission}', [RolePermissionController::class, 'destroyPermission'])
        ->middleware('permission:users.manage');
});

Route::post('/waiting-list/{id}/pedir-chamada', [WaitingListCallController::class, 'pedirChamada']);
Route::post('/waiting-list/chamada/{callId}/resposta', [WaitingListCallController::class, 'respostaChamada']);

Route::get('/waiting-list/chamadas/pendentes', [WaitingListCallController::class, 'chamadasPendentes']);

Route::get('/phpinfo', function () {
    phpinfo();
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
