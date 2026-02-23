<?php

namespace App\Http\Controllers;

use App\Services\BasketballApiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PlayerController extends Controller
{
    public function __construct(private BasketballApiService $basketballApi) {}

    // GET /api/players/top?league=nba&days=7&limit=10
    public function topPlayers(Request $request)
    {
        $league = $request->query('league', null);
        $days = (int) $request->query('days', 7);
        $limit = (int) $request->query('limit', 10);

        $cacheKey = "api.players.top.{$league}.{$days}.{$limit}";
        $players = Cache::remember($cacheKey, 900, function () use ($league, $days, $limit) {
            return $this->basketballApi->getTopPlayersWeek($league, $days, $limit);
        });

        return response()->json($players);
    }

    // GET /api/players/search?q=lebron - Pesquisar jogadores em todas as ligas
    public function search(Request $request)
    {
        $query = $request->query('q', '');

        if (strlen($query) < 2) {
            return response()->json([
                'results' => [],
                'message' => 'Query too short'
            ]);
        }

        try {
            $results = $this->basketballApi->searchPlayers($query);
            return response()->json([
                'results' => $results,
                'query' => $query
            ]);
        } catch (\Exception $e) {
            Log::error('Player search error: ' . $e->getMessage());
            return response()->json([
                'results' => [],
                'error' => 'Search failed'
            ], 500);
        }
    }

    // GET /players/{league}/{playerId} - Página de detalhes do jogador
    public function show(string $league, string $playerId)
    {
        if (function_exists('set_time_limit')) {
            @set_time_limit(60);
        } else {
            @ini_set('max_execution_time', '60');
        }

        try {
            $playerData = $this->basketballApi->getPlayerDetails($league, $playerId);
        } catch (\Throwable $e) {
            Log::error('Error fetching player details: ' . $e->getMessage(), [
                'league' => $league,
                'playerId' => $playerId,
                'exception' => $e,
            ]);
            $playerData = null;
        }

        if (!$playerData) {
            return Inertia::render('Player/Show', [
                'player' => null,
                'league' => $league,
                'error' => 'Player data is temporarily unavailable. Please try again later.'
            ]);
        }

        return Inertia::render('Player/Show', [
            'player' => $playerData,
            'league' => $league,
        ]);
    }
}
