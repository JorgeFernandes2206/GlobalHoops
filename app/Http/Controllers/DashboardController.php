<?php

namespace App\Http\Controllers;

use App\Services\BasketballApiService;
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
        // Increase execution time for this endpoint because aggregation may perform
        // multiple external HTTP calls (scoreboards + summaries) and can exceed
        // the default PHP max execution time in some environments.
        if (function_exists('set_time_limit')) {
            @set_time_limit(120);
        } else {
            @ini_set('max_execution_time', '120');
        }
        // Buscar jogos ao vivo de todas as ligas
        $liveGames = $basketballApi->getLiveGames();

        // Buscar próximos jogos (apenas 1 dia para dashboard, página dedicada tem mais)
        $upcomingGames = $basketballApi->getUpcomingGames(1);

        // Buscar jogos finalizados (apenas 1 dia para dashboard)
        $finishedGames = $basketballApi->getFinishedGames(1);

        // Buscar últimas notícias (apenas 2 para dashboard)
        $news = $basketballApi->getNews(null, 2);

        // Ligas disponíveis
        $leagues = $basketballApi->getLeagues();

        // Notificações do utilizador
        $notifications = [];

        // Try to compute top players with shorter window for faster loading
        $topPlayers = [];
        try {
            // Request 10 players to get 5 NBA + 5 Euroleague balanced mix
            $topPlayers = $this->basketballApi->getTopPlayersWeek('all', 7, 10);
        } catch (\Throwable $e) {
            Log::error('Failed to compute top players for dashboard: ' . $e->getMessage());
            $topPlayers = [];
        }

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
