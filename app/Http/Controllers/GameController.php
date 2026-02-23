<?php

namespace App\Http\Controllers;

use App\Services\BasketballApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class GameController extends Controller
{
    public function __construct(
        private BasketballApiService $basketballApi
    ) {}

    public function live(): JsonResponse
    {
        $games = Cache::remember('api.games.live', 60, function () {
            return $this->basketballApi->getLiveGames();
        });
        return response()->json($games['response'] ?? []);
    }

    public function upcoming(): JsonResponse
    {
        $games = Cache::remember('api.games.upcoming', 900, function () {
            return $this->basketballApi->getUpcomingGames(7);
        });
        return response()->json($games['response'] ?? []);
    }

    public function finished(): JsonResponse
    {
        $games = Cache::remember('api.games.finished', 1800, function () {
            return $this->basketballApi->getFinishedGames(7);
        });
        return response()->json($games);
    }

    public function page(string $league, string $id): InertiaResponse
    {
        // Aumentar limites para evitar timeouts em jogos com muitos dados
        set_time_limit(120); // 2 minutos
        ini_set('memory_limit', '256M');

        // Cache do game summary por 2 minutos (jogos ao vivo mudam rápido)
        $gameData = Cache::remember("game.summary.{$league}.{$id}", 120, function () use ($league, $id) {
            return $this->basketballApi->getGameSummary($league, $id);
        });

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

            $summaryRaw = $gameData;

            $extras['injuriesHome'] = $homeId ? $this->basketballApi->getTeamInjuries($league, $homeId, $summaryRaw) : [];
            $extras['injuriesAway'] = $awayId ? $this->basketballApi->getTeamInjuries($league, $awayId, $summaryRaw) : [];

            $extras['recentHome'] = $homeId ? \Cache::remember("team_recent_{$league}_{$homeId}_5", 60, fn() => $this->basketballApi->getTeamRecentResults($league, $homeId, 5, $summaryRaw)) : [];
            $extras['recentAway'] = $awayId ? \Cache::remember("team_recent_{$league}_{$awayId}_5", 60, fn() => $this->basketballApi->getTeamRecentResults($league, $awayId, 5, $summaryRaw)) : [];

            if ($homeId && $awayId) {
                $extras['headToHead'] = \Cache::remember("headtohead_{$league}_{$homeId}_{$awayId}", 300, fn() => $this->basketballApi->getHeadToHead($league, $homeId, $awayId, 5, $summaryRaw));
            } else {
                $extras['headToHead'] = [];
            }

            $extras['standings'] = \Cache::remember("standings_{$league}", 1800, fn() => $this->basketballApi->getStandings($league, $summaryRaw));

            $extras['odds'] = \Cache::remember("game_odds_{$league}_{$id}", 60, fn() => $this->basketballApi->getOddsForGame($league, $id, $summaryRaw));
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
        }

        $comments = \App\Models\Comment::where('commentable_type', 'Game')
            ->where('commentable_id', "{$league}_{$id}")
            ->topLevel()
            ->with(['replies.user', 'replies.replies.user'])
            ->latest()
            ->limit(50) // Limit to 50 top-level comments
            ->get();

        return Inertia::render('Game/Show', array_merge([
            'game' => $gameData ?? [],
            'league' => $league,
            'gameId' => $id,
            'comments' => $comments,
        ], $extras));
    }
}
