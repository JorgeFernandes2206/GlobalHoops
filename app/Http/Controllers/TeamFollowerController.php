<?php

namespace App\Http\Controllers;

use App\Models\TeamFollower;
use App\Services\BasketballApiService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeamFollowerController extends Controller
{
    protected $basketballApi;

    public function __construct(BasketballApiService $basketballApi)
    {
        $this->basketballApi = $basketballApi;
    }

    /**
     * Show all teams available to follow
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        $followedTeamIds = $user->followedTeamIds();
        
        // Obter liga selecionada (default: NBA)
        $league = $request->input('league', 'nba');
        $country = $request->input('country', null);
        $validLeagues = ['nba', 'euroleague'];
        
        if (!in_array($league, $validLeagues)) {
            $league = 'nba';
        }

        // Fetch teams from API for selected league
        $teamsData = $this->basketballApi->getTeams($league, $country);
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
        
        // Get available countries for Europe filter
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
    }    /**
     * Show teams that user follows
     */
    public function following()
    {
        $user = auth()->user();
        $followers = $user->teamFollowers()->get();

        // Fetch teams from both NBA and Euroleague
        $nbaTeams = collect($this->basketballApi->getTeams('nba')['response'] ?? []);
        $euroleagueTeams = collect($this->basketballApi->getTeams('euroleague')['response'] ?? []);
        $allTeams = $nbaTeams->concat($euroleagueTeams);

        // Match followed teams with API data
        $followedTeams = $followers->map(function ($follower) use ($allTeams) {
            $teamData = $allTeams->firstWhere('id', $follower->team_api_id);

            return [
                'id' => $follower->team_api_id,
                'name' => $teamData['name'] ?? 'Unknown Team',
                'abbreviation' => $teamData['abbreviation'] ?? '',
                'logo_url' => $teamData['logo'] ?? null,
                'league' => $teamData['league'] ?? 'Unknown',
                'notifications_enabled' => $follower->notifications_enabled,
                'followed_at' => $follower->created_at,
            ];
        });

        return Inertia::render('Teams/Following', [
            'teams' => $followedTeams,
        ]);
    }

    /**
     * Follow a team
     */
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

    /**
     * Unfollow a team
     */
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

    /**
     * Toggle notifications for a team
     */
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

    /**
     * Show feed of updates from followed teams
     */
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

        // Fetch NBA teams from API
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

        // Fetch news for followed teams
        $news = $this->basketballApi->getTeamsNews($followedTeamIds, 'nba', 15);

        // Fetch recent games (last 3 days) and upcoming games (next 3 days)
        $recentGames = $this->basketballApi->getFinishedGames(3);
        $upcomingGames = $this->basketballApi->getUpcomingGames(3);

        // Filter games to only include followed teams
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

        // Combine all updates
        $updates = array_merge($news, $relevantGames);

        // Sort by date (most recent first)
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
