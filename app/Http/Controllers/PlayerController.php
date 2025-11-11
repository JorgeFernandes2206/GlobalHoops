<?php

namespace App\Http\Controllers;

use App\Services\BasketballApiService;
use Illuminate\Http\Request;
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

        $players = $this->basketballApi->getTopPlayersWeek($league, $days, $limit);

        return response()->json($players);
    }

    // GET /players/{league}/{playerId} - Página de detalhes do jogador
    public function show(string $league, string $playerId)
    {
        // Increase execution time for this request because fetching player details
        // may perform multiple external summary requests on first load.
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
            // Don't throw a fatal error: render the player page with a null player
            // so the frontend can show a friendly message instead of a 500.
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
