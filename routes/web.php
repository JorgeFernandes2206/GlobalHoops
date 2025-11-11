<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\FavoriteController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/inicio', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('inicio');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// API Routes para refresh
Route::middleware(['auth'])->prefix('api')->group(function () {
    Route::get('/games/live', [GameController::class, 'live']);
    Route::get('/games/upcoming', [GameController::class, 'upcoming']);
    Route::get('/games/finished', [GameController::class, 'finished']);

    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites', [FavoriteController::class, 'store']);
    Route::delete('/favorites/{type}/{id}', [FavoriteController::class, 'destroy']);

    // Novas rotas para notícias e equipas
    Route::get('/news', function (App\Services\BasketballApiService $service) {
        $league = request('league');
        $limit = request('limit', 10);
        return $service->getNews($league, $limit);
    });

    Route::get('/teams/{league}', function (App\Services\BasketballApiService $service, string $league) {
        return $service->getTeams($league);
    });

    Route::get('/teams/{league}/{teamId}', function (App\Services\BasketballApiService $service, string $league, string $teamId) {
        return $service->getTeam($league, $teamId);
    });

    // Top players aggregation
    Route::get('/players/top', [App\Http\Controllers\PlayerController::class, 'topPlayers']);
});

// Página de detalhes do jogador
Route::get('/players/{league}/{playerId}', [App\Http\Controllers\PlayerController::class, 'show'])
    ->middleware(['auth'])
    ->name('players.show');

// Página pública do jogo (frontend) - renderiza a página Inertia com detalhes do jogo
Route::get('/games/{league}/{id}', [GameController::class, 'page'])->middleware(['auth'])->name('games.show');

require __DIR__.'/auth.php';
