<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\TopicController;
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

// Backwards-compatible route name for auth scaffolding and packages that expect 'dashboard'
Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Team Following Routes
    Route::get('/teams', [App\Http\Controllers\TeamFollowerController::class, 'index'])->name('teams.index');
    Route::get('/teams/following', [App\Http\Controllers\TeamFollowerController::class, 'following'])->name('teams.following');
    Route::get('/teams/feed', [App\Http\Controllers\TeamFollowerController::class, 'feed'])->name('teams.feed');
    Route::post('/teams/follow', [App\Http\Controllers\TeamFollowerController::class, 'follow'])->name('teams.follow');
    Route::post('/teams/unfollow', [App\Http\Controllers\TeamFollowerController::class, 'unfollow'])->name('teams.unfollow');
    Route::post('/teams/notifications', [App\Http\Controllers\TeamFollowerController::class, 'toggleNotifications'])->name('teams.notifications');

    // Push Notification Routes
    Route::post('/push/subscribe', [App\Http\Controllers\PushSubscriptionController::class, 'subscribe'])->name('push.subscribe');
    Route::post('/push/unsubscribe', [App\Http\Controllers\PushSubscriptionController::class, 'unsubscribe'])->name('push.unsubscribe');
    Route::get('/push/vapid-public-key', [App\Http\Controllers\PushSubscriptionController::class, 'vapidPublicKey'])->name('push.vapid');
});


// API Routes para refresh
Route::middleware(['auth'])->prefix('api')->group(function () {
    Route::get('/games/live', [GameController::class, 'live']);
    Route::get('/games/upcoming', [GameController::class, 'upcoming']);
    Route::get('/games/finished', [GameController::class, 'finished']);

    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites', [FavoriteController::class, 'store']);
    Route::delete('/favorites/{type}/{id}', [FavoriteController::class, 'destroy']);

    // Rota API para notícias (usado pelo frontend via AJAX)
    Route::get('/news-data', function (App\Services\BasketballApiService $service) {
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

    // Standings
    Route::get('/standings/{league}', function (App\Services\BasketballApiService $service, string $league, Illuminate\Http\Request $request) {
        try {
            $standings = $service->getStandings($league);
            
            if ($standings === null) {
                return response()->json([
                    'error' => 'Standings not available for this league',
                    'league' => $league
                ], 404);
            }
            
            // Filter by conference if requested
            $conference = $request->query('conference');
            if ($conference && $league === 'nba') {
                $conferenceMap = [
                    'eastern' => 'Eastern Conference',
                    'western' => 'Western Conference'
                ];
                $conferenceName = $conferenceMap[$conference] ?? null;
                
                if ($conferenceName) {
                    $standings = array_filter($standings, function($team) use ($conferenceName) {
                        return isset($team['conference']) && $team['conference'] === $conferenceName;
                    });
                    $standings = array_values($standings); // Re-index array
                }
            }
            
            return response()->json($standings);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch standings',
                'message' => $e->getMessage()
            ], 500);
        }
    });

    // Top players aggregation
    Route::get('/players/top', [App\Http\Controllers\PlayerController::class, 'topPlayers']);
    
    // Player search
    Route::get('/players/search', [App\Http\Controllers\PlayerController::class, 'search']);
});

// Página de detalhes do jogador
Route::get('/players/{league}/{playerId}', [App\Http\Controllers\PlayerController::class, 'show'])
    ->middleware(['auth'])
    ->name('players.show');

// Games pages
Route::get('/games', function () {
    return Inertia::render('Games/Index');
})->middleware(['auth'])->name('games.index');

// News page
Route::get('/news', function () {
    return Inertia::render('News/Index');
})->middleware(['auth'])->name('news.index');

// Standings page
Route::get('/standings', function () {
    return Inertia::render('Standings/Index');
})->middleware(['auth'])->name('standings.index');

// Página pública do jogo (frontend) - renderiza a página Inertia com detalhes do jogo
Route::get('/games/{league}/{id}', [GameController::class, 'page'])->middleware(['auth'])->name('games.show');

// Forum routes
Route::prefix('forum')->name('forum.')->group(function () {
    Route::get('/', [TopicController::class, 'index'])->name('index');
    Route::get('/create', [TopicController::class, 'create'])->middleware('auth')->name('create');
    Route::post('/', [TopicController::class, 'store'])->middleware('auth')->name('store');
    Route::get('/{id}', [TopicController::class, 'show'])->name('show');
    Route::delete('/{id}', [TopicController::class, 'destroy'])->middleware('auth')->name('destroy');
});

// Comments routes
Route::middleware(['auth'])->group(function () {
    Route::post('/comments', [App\Http\Controllers\CommentController::class, 'store'])->name('comments.store');
    Route::delete('/comments/{comment}', [App\Http\Controllers\CommentController::class, 'destroy'])->name('comments.destroy');
    Route::get('/comments', [App\Http\Controllers\CommentController::class, 'index'])->name('comments.index');
});

require __DIR__.'/auth.php';
