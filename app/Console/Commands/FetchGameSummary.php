<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\BasketballApiService;

class FetchGameSummary extends Command
{
    /**
     * The name and signature of the console command.
     *
     * league default is nba. gameId is optional; if omitted the command will try to find a recent finished game.
     */
    protected $signature = 'fetch:summary {league=nba} {gameId?}';

    /**
     * The console command description.
     */
    protected $description = 'Fetch a game summary via BasketballApiService and write to storage/logs for inspection';

    public function __construct(private BasketballApiService $basketballApi)
    {
        parent::__construct();
    }

    public function handle()
    {
        $league = $this->argument('league') ?? 'nba';
        $gameId = $this->argument('gameId');

        if (!$gameId) {
            $this->info('No gameId provided, searching for a recent finished game...');
            $finished = $this->basketballApi->getFinishedGames(3);
            $first = $finished['response'][0] ?? null;
            if ($first && isset($first['id'])) {
                $gameId = $first['id'];
                $this->info("Found game id: {$gameId}");
            } else {
                $this->error('Could not find a recent finished game automatically. Try passing a gameId.');
                return 1;
            }
        }

        $this->info("Fetching summary for league={$league} gameId={$gameId}...");
        $summary = $this->basketballApi->getGameSummary($league, $gameId);

        if (!$summary) {
            $this->error('No summary returned from service. Check logs for ESPN API errors.');
            return 1;
        }

        $path = storage_path("logs/game_summary_{$league}_{$gameId}.json");
        try {
            file_put_contents($path, json_encode($summary, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
            $this->info("Wrote summary to: {$path}");
        } catch (\Exception $e) {
            $this->error('Failed to write file: ' . $e->getMessage());
            return 1;
        }

        // Also attempt to parse injuries for the two teams if possible
        try {
            $header = $summary['header'] ?? null;
            $competitions = $header['competitions'][0] ?? null;
            $competitors = $competitions['competitors'] ?? [];
            $home = null; $away = null;
            foreach ($competitors as $c) {
                if (($c['homeAway'] ?? '') === 'home') $home = $c;
                if (($c['homeAway'] ?? '') === 'away') $away = $c;
            }

            $homeId = $home['team']['id'] ?? null;
            $awayId = $away['team']['id'] ?? null;

            if ($homeId) {
                $injHome = $this->basketballApi->getTeamInjuries($league, $homeId, $summary);
                $this->info('Home injuries: ' . json_encode($injHome));
            }
            if ($awayId) {
                $injAway = $this->basketballApi->getTeamInjuries($league, $awayId, $summary);
                $this->info('Away injuries: ' . json_encode($injAway));
            }
            // Recent results
            if ($homeId) {
                $recentHome = $this->basketballApi->getTeamRecentResults($league, $homeId, 5, $summary);
                $this->info('Recent Home: ' . json_encode($recentHome));
            }
            if ($awayId) {
                $recentAway = $this->basketballApi->getTeamRecentResults($league, $awayId, 5, $summary);
                $this->info('Recent Away: ' . json_encode($recentAway));
            }

            // Head to head
            if ($homeId && $awayId) {
                $h2h = $this->basketballApi->getHeadToHead($league, $homeId, $awayId, 5, $summary);
                $this->info('HeadToHead: ' . json_encode($h2h));
            }

            // Standings
            $standings = $this->basketballApi->getStandings($league, $summary);
            $this->info('Standings: ' . json_encode($standings));
        } catch (\Throwable $e) {
            $this->warn('Could not parse injuries: ' . $e->getMessage());
        }

        return 0;
    }
}
