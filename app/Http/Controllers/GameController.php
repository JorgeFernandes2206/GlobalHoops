<?php

namespace App\Http\Controllers;

use App\Services\BasketballApiService;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class GameController extends Controller
{
    public function __construct(
        private BasketballApiService $basketballApi
    ) {}

    public function live(): JsonResponse
    {
        $games = $this->basketballApi->getLiveGames();
        return response()->json($games['response'] ?? []);
    }

    public function upcoming(): JsonResponse
    {
        $games = $this->basketballApi->getUpcomingGames(7);
        return response()->json($games['response'] ?? []);
    }

    public function finished(): JsonResponse
    {
        $games = $this->basketballApi->getFinishedGames(7);
        return response()->json($games['response'] ?? []);
    }

    // Removed unused show(int $id) method that returned getGame(); using page() with getGameSummary instead

    // Render Inertia page for a game detail (used by frontend link)
    public function page(string $league, string $id): InertiaResponse
    {
        // Buscar informações completas do jogo via ESPN summary endpoint
        $gameData = $this->basketballApi->getGameSummary($league, $id);
        
        // Debug logs only when app.debug is true
        if (config('app.debug')) {
            \Log::debug('Game Page - Data from service', [
                'league' => $league,
                'gameId' => $id,
                'gameData_is_null' => $gameData === null,
                'gameData_keys' => $gameData ? array_keys($gameData) : [],
                'has_header' => isset($gameData['header']),
                'has_boxscore' => isset($gameData['boxscore']),
            ]);
        }
        
        // Se não houver dados, tentar buscar novamente sem cache
        if (!$gameData || !isset($gameData['header'])) {
            \Log::warning('Game data is null or incomplete, clearing cache and retrying');
            \Cache::forget("game_summary_{$league}_{$id}");
            $gameData = $this->basketballApi->getGameSummary($league, $id);
        }
        // Additional derived datasets: injuries, recent results, head-to-head, standings
        $extras = [];
        try {
            $header = $gameData['header'] ?? null;
            $competitions = $header['competitions'][0] ?? null;
            $competitors = $competitions['competitors'] ?? [];
            $home = null; $away = null;
            foreach ($competitors as $c) {
                if (($c['homeAway'] ?? '') === 'home') $home = $c;
                if (($c['homeAway'] ?? '') === 'away') $away = $c;
            }

            $homeId = $home['team']['id'] ?? null;
            $awayId = $away['team']['id'] ?? null;

            // Reuse already-fetched $gameData as the summary payload to avoid duplicate remote calls
            $summaryRaw = $gameData;

            // Injuries: pass the summary payload directly (fast, no remote call)
            $extras['injuriesHome'] = $homeId ? $this->basketballApi->getTeamInjuries($league, $homeId, $summaryRaw) : [];
            $extras['injuriesAway'] = $awayId ? $this->basketballApi->getTeamInjuries($league, $awayId, $summaryRaw) : [];

            // Recent results and head-to-head can be moderately expensive; cache them briefly.
            $extras['recentHome'] = $homeId ? \Cache::remember("team_recent_{$league}_{$homeId}_5", 60, fn() => $this->basketballApi->getTeamRecentResults($league, $homeId, 5, $summaryRaw)) : [];
            $extras['recentAway'] = $awayId ? \Cache::remember("team_recent_{$league}_{$awayId}_5", 60, fn() => $this->basketballApi->getTeamRecentResults($league, $awayId, 5, $summaryRaw)) : [];

            if ($homeId && $awayId) {
                $extras['headToHead'] = \Cache::remember("headtohead_{$league}_{$homeId}_{$awayId}", 300, fn() => $this->basketballApi->getHeadToHead($league, $homeId, $awayId, 5, $summaryRaw));
            } else {
                $extras['headToHead'] = [];
            }

            // Standings change infrequently; cache for longer
            $extras['standings'] = \Cache::remember("standings_{$league}", 1800, fn() => $this->basketballApi->getStandings($league, $summaryRaw));
        } catch (\Throwable $e) {
            \Log::warning('Failed to fetch extra game datasets: '.$e->getMessage());
            $extras = array_merge($extras, [
                'injuriesHome' => [],
                'injuriesAway' => [],
                'recentHome' => [],
                'recentAway' => [],
                'headToHead' => [],
                'standings' => null,
            ]);
        }

        // Log counts to help debug missing props in the frontend
        try {
            \Log::debug('GameController::page - extras counts', [
                'league' => $league,
                'gameId' => $id,
                'homeId' => $homeId ?? null,
                'awayId' => $awayId ?? null,
                'injuriesHome_count' => is_array($extras['injuriesHome'] ?? null) ? count($extras['injuriesHome']) : null,
                'injuriesAway_count' => is_array($extras['injuriesAway'] ?? null) ? count($extras['injuriesAway']) : null,
                'recentHome_count' => is_array($extras['recentHome'] ?? null) ? count($extras['recentHome']) : null,
                'recentAway_count' => is_array($extras['recentAway'] ?? null) ? count($extras['recentAway']) : null,
                'headToHead_count' => is_array($extras['headToHead'] ?? null) ? count($extras['headToHead']) : null,
            ]);
        } catch (\Throwable $e) {
            // Non-fatal
        }

        return Inertia::render('Game/Show', array_merge([
            'game' => $gameData ?? [],
            'league' => $league,
            'gameId' => $id,
        ], $extras));
    }
}
