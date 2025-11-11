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

        // Buscar próximos jogos (próximos 3 dias para velocidade)
        $upcomingGames = $basketballApi->getUpcomingGames(3);

        // Buscar jogos finalizados (últimos 3 dias para velocidade)
        $finishedGames = $basketballApi->getFinishedGames(3);

        // Buscar últimas notícias (top 5)
        $news = $basketballApi->getNews(null, 5);

        // Ligas disponíveis
        $leagues = $basketballApi->getLeagues();

        // Notificações do utilizador
        $notifications = [];

        // Try to compute top players server-side to avoid empty client state.
        // If the aggregation process times out or fails, catch the exception,
        // log it and continue gracefully with an empty array.
        $topPlayers = [];
        try {
            $topPlayers = $this->basketballApi->getTopPlayersWeek('nba', 7, 6);
            if (empty($topPlayers) || (is_array($topPlayers) && count($topPlayers) === 0)) {
                // Try 30 days
                $topPlayers = $this->basketballApi->getTopPlayersWeek('nba', 30, 6);
            }
            if (empty($topPlayers) || (is_array($topPlayers) && count($topPlayers) === 0)) {
                // Try full season / larger window
                $topPlayers = $this->basketballApi->getTopPlayersWeek('nba', 180, 6);
            }
        } catch (\Throwable $e) {
            // Log the error for debugging and fall back to empty data so the page still loads.
            Log::error('Failed to compute top players for dashboard: ' . $e->getMessage(), [
                'exception' => $e,
            ]);
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
