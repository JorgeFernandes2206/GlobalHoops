<?php

namespace App\Http\Controllers;

use App\Services\BasketballApiService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private BasketballApiService $basketballApi
    ) {}

    public function index(BasketballApiService $basketballApi)
    {
        if (function_exists('set_time_limit')) {
            @set_time_limit(120);
        } else {
            @ini_set('max_execution_time', '120');
        }

        // Cache live games por 1 minuto (jogos ao vivo mudam frequentemente)
        $liveGames = Cache::remember('dashboard.live_games', 60, function () use ($basketballApi) {
            return $basketballApi->getLiveGames();
        });

        // Cache upcoming games por 30 minutos (horários não mudam frequentemente)
        $upcomingGames = Cache::remember('dashboard.upcoming_games', 1800, function () use ($basketballApi) {
            return $basketballApi->getUpcomingGames(5);
        });

        // Cache finished games por 1 hora (resultados finais não mudam)
        $finishedGames = Cache::remember('dashboard.finished_games', 3600, function () use ($basketballApi) {
            return $basketballApi->getFinishedGames(7);
        });

        $news = [];

        $leagues = [];

        $notifications = [];

        // Cache top players por 1 hora
        $topPlayers = Cache::remember('dashboard.top_players', 3600, function () {
            try {
                return $this->basketballApi->getTopPlayersWeek('all', 5, 8);
            } catch (\Throwable $e) {
                Log::error('Failed to compute top players for dashboard: ' . $e->getMessage());
                return [];
            }
        });
        return Inertia::render('Dashboard', [
            'liveGames' => $liveGames['response'] ?? [],
            'upcomingGames' => $upcomingGames['response'] ?? [],
            'finishedGames' => $finishedGames['response'] ?? [],
            'news' => $news['response'] ?? [],
            'topPlayers' => $topPlayers ?? [],
            'leagues' => $leagues['response'] ?? [],
            'notifications' => $notifications,
        ]);
    }
}
