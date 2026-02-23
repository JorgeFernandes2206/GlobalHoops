<?php

namespace App\Http\Controllers;

use App\Models\TeamFollower;
use App\Services\BasketballApiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class TeamFollowerController extends Controller
{
    protected $basketballApi;

    public function __construct(BasketballApiService $basketballApi)
    {
        $this->basketballApi = $basketballApi;
    }

    public function index(Request $request)
    {
        $user = auth()->user();
        $followedTeamIds = $user->followedTeamIds();

        $league = $request->input('league', 'nba');
        $country = $request->input('country', null);
        $validLeagues = ['nba', 'euroleague'];

        if (!in_array($league, $validLeagues)) {
            $league = 'nba';
        }

        // Cache teams list por 1 hora (lista raramente muda)
        $cacheKey = "teams.{$league}." . ($country ?? 'all');
        $teamsData = Cache::remember($cacheKey, 3600, function () use ($league, $country) {
            return $this->basketballApi->getTeams($league, $country);
        });
        $teams = collect($teamsData['response'] ?? [])->map(function ($team) use ($followedTeamIds) {
            return [
                'id' => (string)$team['id'],
                'name' => $team['name'],
                'abbreviation' => $team['abbreviation'],
                'logo_url' => $team['logo'],
                'color' => $team['color'],
                'league' => $team['league'],
                'city' => $team['city'] ?? null,
                'country' => $team['country'] ?? null,
                'is_following' => in_array((string)$team['id'], $followedTeamIds),
            ];
        });

        $availableCountries = [];
        if ($league === 'euroleague') {
            $euroleagueService = app(\App\Services\EuroleagueService::class);
            $availableCountries = $euroleagueService->getCountries();
        }

        return Inertia::render('Teams/Index', [
            'teams' => $teams,
            'followedTeamIds' => $followedTeamIds,
            'selectedLeague' => $league,
            'selectedCountry' => $country,
            'availableLeagues' => [
                ['id' => 'nba', 'name' => 'NBA'],
                ['id' => 'euroleague', 'name' => 'Europe'],
            ],
            'availableCountries' => $availableCountries,
        ]);
    }

    public function follow(Request $request)
    {
        $request->validate([
            'team_api_id' => 'required|string',
        ]);

        $user = auth()->user();
        $teamApiId = $request->team_api_id;

        if ($user->followsTeam($teamApiId)) {
            return back()->with('error', 'You are already following this team');
        }

        TeamFollower::create([
            'user_id' => $user->id,
            'team_api_id' => $teamApiId,
            'notifications_enabled' => true,
        ]);

        return back()->with('success', 'You are now following this team');
    }

    public function unfollow(Request $request)
    {
        $request->validate([
            'team_api_id' => 'required|string',
        ]);

        $user = auth()->user();
        $teamApiId = $request->team_api_id;

        $deleted = TeamFollower::where('user_id', $user->id)
            ->where('team_api_id', $teamApiId)
            ->delete();

        \Log::info('Unfollow attempt', [
            'user_id' => $user->id,
            'team_api_id' => $teamApiId,
            'deleted_count' => $deleted
        ]);

        return redirect()->back();
    }

    public function toggleNotifications(Request $request)
    {
        $request->validate([
            'team_api_id' => 'required|string',
        ]);

        $user = auth()->user();
        $follower = TeamFollower::where('user_id', $user->id)
            ->where('team_api_id', $request->team_api_id)
            ->first();

        if (!$follower) {
            return back()->with('error', 'You are not following this team');
        }

        $follower->notifications_enabled = !$follower->notifications_enabled;
        $follower->save();

        $status = $follower->notifications_enabled ? 'enabled' : 'disabled';
        return back()->with('success', "Notifications {$status}");
    }

    public function feed()
    {
        $user = auth()->user();
        $followedTeamIds = $user->followedTeamIds();

        if (empty($followedTeamIds)) {
            return Inertia::render('Teams/Feed', [
                'followedTeams' => [],
                'followedTeamsCount' => 0,
                'updates' => [],
            ]);
        }

        // Busca jogos NBA da API
        $teamsData = $this->basketballApi->getTeams('nba');
        $allTeams = collect($teamsData['response'] ?? []);

        // Get details for followed teams
        $followedTeams = $allTeams->filter(function ($team) use ($followedTeamIds) {
            return in_array((string)$team['id'], $followedTeamIds);
        })->map(function ($team) {
            return [
                'id' => (string)$team['id'],
                'name' => $team['name'],
                'abbreviation' => $team['abbreviation'],
                'logo_url' => $team['logo'],
            ];
        })->values();

        $news = $this->basketballApi->getTeamsNews($followedTeamIds, 'nba', 15);

        $recentGames = $this->basketballApi->getFinishedGames(3);
        $upcomingGames = $this->basketballApi->getUpcomingGames(3);

        $relevantGames = [];

        foreach (($recentGames['response'] ?? []) as $game) {
            $homeId = (string)($game['teams']['home']['id'] ?? '');
            $awayId = (string)($game['teams']['away']['id'] ?? '');

            if (in_array($homeId, $followedTeamIds) || in_array($awayId, $followedTeamIds)) {
                $relevantGames[] = array_merge($game, ['type' => 'game_result']);
            }
        }

        foreach (($upcomingGames['response'] ?? []) as $game) {
            $homeId = (string)($game['teams']['home']['id'] ?? '');
            $awayId = (string)($game['teams']['away']['id'] ?? '');

            if (in_array($homeId, $followedTeamIds) || in_array($awayId, $followedTeamIds)) {
                $relevantGames[] = array_merge($game, ['type' => 'upcoming_game']);
            }
        }

        $updates = array_merge($news, $relevantGames);

        usort($updates, function($a, $b) {
            $dateA = $a['published'] ?? $a['date'] ?? '';
            $dateB = $b['published'] ?? $b['date'] ?? '';
            return strtotime($dateB) - strtotime($dateA);
        });

        return Inertia::render('Teams/Feed', [
            'followedTeams' => $followedTeams,
            'followedTeamsCount' => $followedTeams->count(),
            'updates' => $updates,
        ]);
    }
}
