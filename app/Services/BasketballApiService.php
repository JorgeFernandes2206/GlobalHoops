<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http as HttpClient;

class BasketballApiService
{
    private string $espnBaseUrl = 'https://site.api.espn.com/apis/site/v2/sports/basketball';

    // Ligas disponíveis na ESPN
    private array $leagues = [
        'nba' => 'NBA',
        'wnba' => 'WNBA',
        'mens-college-basketball' => 'Men\'s College Basketball',
        'womens-college-basketball' => 'Women\'s College Basketball',
    ];

    private function makeRequest(string $league, string $endpoint, array $params = [])
    {
        // Lightweight caching for expensive/commonly-requested endpoints.
        $cacheKey = 'espn_' . $league . '_' . $endpoint . '_' . md5(json_encode($params));

        // Choose conservative TTLs: scoreboard is short-lived, summary is longer.
        $ttl = 60; // default 1 minute
        if ($endpoint === 'summary') {
            $ttl = 3600; // cache summaries 1 hour
        }
        if ($endpoint === 'scoreboard' && isset($params['dates'])) {
            $ttl = 30; // scoreboard per date: 30s
        }

        // Use cache when available to avoid repeated external calls.
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        try {
            $url = "{$this->espnBaseUrl}/{$league}/{$endpoint}";
            // Reduce retries/timeouts to keep worst-case latency bounded
            $client = Http::retry(1, 300)->timeout(6);
            if (app()->environment('local')) {
                $client = $client->withOptions(['verify' => false]);
            }

            $start = microtime(true);
            $response = $client->get($url, $params);
            $duration = round((microtime(true) - $start) * 1000); // ms

            if ($response->successful()) {
                $json = $response->json();
                // Cache successful responses according to TTL
                try {
                    Cache::put($cacheKey, $json, $ttl);
                } catch (\Exception $e) {
                    // Non-fatal if cache write fails
                    Log::warning('ESPn cache write failed', ['key' => $cacheKey, 'error' => $e->getMessage()]);
                }

                if ($duration > 500) {
                    Log::info('Slow ESPN request', ['league' => $league, 'endpoint' => $endpoint, 'params' => $params, 'duration_ms' => $duration]);
                }

                return $json;
            }

            Log::error('ESPN API Error', [
                'league' => $league,
                'endpoint' => $endpoint,
                'status' => $response->status(),
                'duration_ms' => $duration ?? null,
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('ESPN API Exception', [
                'league' => $league,
                'endpoint' => $endpoint,
                'message' => $e->getMessage(),
            ]);
            return null;
        }
    }

    // Jogos ao vivo de todas as ligas
    public function getLiveGames()
    {
        return Cache::remember('live_games', 60, function () {
            $allGames = [];

            // Apenas NBA para velocidade (adiciona outras ligas se necessário)
            $priorityLeagues = ['nba'];

            foreach ($priorityLeagues as $league) {
                $data = $this->makeRequest($league, 'scoreboard');

                if ($data && isset($data['events'])) {
                    foreach ($data['events'] as $event) {
                        // Apenas jogos ao vivo (in progress)
                        if (isset($event['status']['type']['state']) &&
                            $event['status']['type']['state'] === 'in') {
                            $allGames[] = $this->formatGame($event, $league);
                        }
                    }
                }
            }

            return ['response' => $allGames];
        });
    }

    // Próximos jogos (próximos 7 dias) de todas as ligas
    public function getUpcomingGames(int $days = 3)
    {
        return Cache::remember("upcoming_games_{$days}", 600, function () use ($days) {
            $allGames = [];

            // Buscar jogos de hoje e dos próximos dias (apenas NBA por defeito para velocidade)
            $priorityLeagues = ['nba'];

            for ($i = 0; $i < $days; $i++) {
                $date = now()->addDays($i)->format('Ymd');

                foreach ($priorityLeagues as $league) {
                    $data = $this->makeRequest($league, 'scoreboard', ['dates' => $date]);

                    if ($data && isset($data['events'])) {
                        foreach ($data['events'] as $event) {
                            // Apenas jogos futuros (not started)
                            if (isset($event['status']['type']['state']) &&
                                $event['status']['type']['state'] === 'pre') {
                                $allGames[] = $this->formatGame($event, $league);
                            }
                        }
                    }
                }
            }

            // Ordenar por data
            usort($allGames, function($a, $b) {
                return strtotime($a['date']) - strtotime($b['date']);
            });

            // Try to augment upcoming games with external odds provider (the-odds-api) when available.
            // We will fetch odds for the NBA sport and attempt to match events by team names and commence time.
            try {
                $gamesForMatching = array_map(fn($g) => [
                    'id' => $g['id'] ?? null,
                    'date' => $g['date'] ?? null,
                    'home' => $g['teams']['home']['name'] ?? null,
                    'away' => $g['teams']['away']['name'] ?? null,
                ], $allGames);

                $oddsMap = $this->fetchOddsApiForGames('basketball_nba', $gamesForMatching);
                foreach ($allGames as &$game) {
                    if (empty($game['odds']) && isset($oddsMap[$game['id']])) {
                        $game['odds'] = $oddsMap[$game['id']];
                    }
                }
                unset($game);
            } catch (\Throwable $e) {
                Log::warning('Failed to fetch/merge Odds-API odds for upcoming games: '.$e->getMessage());
            }

            return ['response' => $allGames];
        });
    }

    /**
     * Fetch odds from SportsGameOdds (SGO) for a list of event IDs.
     * Uses env vars: SGO_BASE_URL (default provided), SGO_API_KEY (optional).
     * Returns a map keyed by event id => raw event payload from SGO.
     */
    private function fetchSgoOddsForEvents(string $league, array $eventIds = []): array
    {
        $base = env('SGO_BASE_URL', 'https://api.sportsgameodds.com/v2');
        $apiKey = env('SGO_API_KEY', null);
        $leagueId = strtoupper($league);

        $cacheKey = 'sgo_odds_' . strtolower($league) . '_' . md5(json_encode($eventIds));
        return Cache::remember($cacheKey, 60, function () use ($base, $apiKey, $leagueId, $eventIds) {
            $url = rtrim($base, '/') . '/events';
            $query = ['oddsAvailable' => 'true', 'leagueID' => $leagueId];
            if (!empty($eventIds)) {
                // SGO supports filtering by event IDs via eventIDs param (comma-separated)
                $query['eventIDs'] = implode(',', $eventIds);
            }

            try {
                $client = Http::timeout(8);
                if ($apiKey) {
                    // prefer x-api-key header for SGO; if they require a bearer token the env can include prefix
                    $client = $client->withHeaders(['x-api-key' => $apiKey]);
                }

                $resp = $client->get($url, $query);
                if ($resp->successful()) {
                    $json = $resp->json();
                    // Expecting events array; try common keys
                    $events = $json['events'] ?? $json['data'] ?? ($json['response'] ?? $json);
                    $map = [];
                    if (is_array($events)) {
                        foreach ($events as $ev) {
                            $id = $ev['id'] ?? $ev['eventId'] ?? $ev['eventID'] ?? null;
                            if ($id) {
                                $map[(string)$id] = $ev;
                            }
                        }
                    }
                    return $map;
                }
            } catch (\Throwable $e) {
                Log::warning('SGO odds fetch error', ['error' => $e->getMessage()]);
            }

            return [];
        });
    }

    /**
     * Normalize a single SGO event payload into our odds shape.
     */
    private function normalizeSgoEventOdds(array $ev): array
    {
        $raw = $ev;
        $provider = $ev['provider'] ?? 'SGO';

        $homeMoneyline = $ev['homeMoneyline'] ?? $ev['home_odds'] ?? null;
        $awayMoneyline = $ev['awayMoneyline'] ?? $ev['away_odds'] ?? null;
        $overUnder = $ev['overUnder'] ?? $ev['total'] ?? null;
        $homeSpread = $ev['homeSpread'] ?? $ev['home_spread'] ?? null;
        $awaySpread = $ev['awaySpread'] ?? $ev['away_spread'] ?? null;

        // Try to extract from markets if present (common provider format)
        if (isset($ev['markets']) && is_array($ev['markets'])) {
            foreach ($ev['markets'] as $m) {
                $type = strtolower($m['marketType'] ?? ($m['type'] ?? ''));
                if (str_contains($type, 'money') || str_contains($type, 'ml') || $type === 'moneyline') {
                    // try home/away prices
                    $homeMoneyline = $homeMoneyline ?? ($m['homePrice'] ?? ($m['prices'][0]['price'] ?? null));
                    $awayMoneyline = $awayMoneyline ?? ($m['awayPrice'] ?? ($m['prices'][1]['price'] ?? null));
                }
                if (str_contains($type, 'spread')) {
                    $homeSpread = $homeSpread ?? ($m['homeValue'] ?? ($m['prices'][0]['point'] ?? null));
                    $awaySpread = $awaySpread ?? ($m['awayValue'] ?? ($m['prices'][1]['point'] ?? null));
                }
                if (str_contains($type, 'total') || str_contains($type, 'over')) {
                    $overUnder = $overUnder ?? ($m['total'] ?? ($m['point'] ?? null));
                }
            }
        }

        return [
            'provider' => $provider,
            'overUnder' => $overUnder,
            'homeMoneyline' => $homeMoneyline,
            'awayMoneyline' => $awayMoneyline,
            'homeSpread' => $homeSpread,
            'awaySpread' => $awaySpread,
            'raw' => $raw,
        ];
    }

    /**
     * Fetch odds from The Odds API (the-odds-api.com) for a list of candidate games.
     * Expects $sport like 'basketball_nba' and $candidates as array of ['id','date','home','away']
     * Returns map of local game id => normalized odds.
     */
    private function fetchOddsApiForGames(string $sport, array $candidates = []): array
    {
        $base = env('ODDS_API_BASE', 'https://api.the-odds-api.com/v4');
        $apiKey = env('ODDS_API_KEY');
        if (empty($apiKey)) {
            // If no API key is configured, skip calling external odds provider.
            Log::warning('ODDS_API_KEY not set; skipping Odds-API fetch');
            return [];
        }

        // Cache key per sport and day to limit requests
        $cacheKey = 'odds_api_' . $sport . '_' . date('Ymd');
        return Cache::remember($cacheKey, 60, function () use ($base, $apiKey, $sport, $candidates) {
            $url = rtrim($base, '/') . "/sports/{$sport}/odds";
            $query = [
                'regions' => 'us',
                'markets' => 'h2h,spreads,totals',
                'oddsFormat' => 'american',
                'dateFormat' => 'iso',
                'apiKey' => $apiKey,
            ];

                try {
                    $client = Http::timeout(8);
                    // In local development allow skipping SSL verification (developer machine may lack CA bundle)
                    if (app()->environment('local')) {
                        $client = $client->withOptions(['verify' => false]);
                    }
                    $resp = $client->get($url, $query);
                if (!$resp->successful()) {
                    Log::warning('Odds-API non-success response', ['status' => $resp->status(), 'body' => $resp->body()]);
                    return [];
                }

                $list = $resp->json();
                if (!$list) return [];

                // Some responses from the Odds API wrap the actual array under a 'value' key (or similar).
                // Normalize to an array of entries regardless of top-level shape.
                $entries = [];
                if (isset($list['value']) && is_array($list['value'])) {
                    $entries = $list['value'];
                } elseif (isset($list['data']) && is_array($list['data'])) {
                    $entries = $list['data'];
                } elseif (is_array($list)) {
                    // If the top-level array is an associative array with numeric keys, use it.
                    // If it's a sequential array, use it directly.
                    $isSequential = array_values($list) === $list;
                    $entries = $isSequential ? $list : (array_values($list)[0] ?? []);
                }

                if (!is_array($entries)) return [];

                // Debug: log counts to help troubleshoot matching issues
                try {
                    Log::debug('Odds-API fetched entries', ['sport' => $sport, 'entries_count' => count($entries), 'candidates_count' => count($candidates ?? [])]);
                } catch (\Throwable $e) {
                    // ignore logging failures
                }

                $map = [];
                // Normalize provider markets for easier matching
                foreach ($entries as $entry) {
                    // Entry contains: id (event id), sport_key, commence_time, home_team, away_team, sites[]
                    $home = $entry['home_team'] ?? null;
                    $away = $entry['away_team'] ?? null;
                    $commence = $entry['commence_time'] ?? null;

                    // Try to find a candidate that matches by team names and similar commence_time
                    foreach ($candidates as $cand) {
                        if (!$cand['id']) continue;
                        $matchHome = $this->teamsMatch($home, $cand['home']);
                        $matchAway = $this->teamsMatch($away, $cand['away']);
                        $timeDiff = 0;
                        if ($commence && $cand['date']) {
                            try { $timeDiff = abs(strtotime($commence) - strtotime($cand['date'])); } catch (\Throwable $e) { $timeDiff = PHP_INT_MAX; }
                        }
                        if ($matchHome && $matchAway && $timeDiff < 3600*6) { // within 6 hours
                            $map[$cand['id']] = $this->normalizeOddsApiEntry($entry);
                            try {
                                Log::debug('Odds-API match', [
                                    'sport' => $sport,
                                    'candidate_id' => $cand['id'],
                                    'candidate_home' => $cand['home'] ?? null,
                                    'candidate_away' => $cand['away'] ?? null,
                                    'entry_id' => $entry['id'] ?? null,
                                    'entry_home' => $home,
                                    'entry_away' => $away,
                                    'commence' => $commence,
                                    'candidate_date' => $cand['date'] ?? null,
                                    'time_diff_seconds' => $timeDiff,
                                ]);
                            } catch (\Throwable $e) {
                                // ignore logging failures
                            }
                        }
                    }
                }

                try {
                    Log::debug('Odds-API mapping result', ['matches' => count($map)]);
                } catch (\Throwable $e) {}

                return $map;
            } catch (\Throwable $e) {
                Log::warning('Odds-API fetch error', ['error' => $e->getMessage()]);
                return [];
            }
        });
    }

    /**
     * Simple fuzzy team name matcher (case-insensitive, partial token match)
     */
    private function teamsMatch(?string $a, ?string $b): bool
    {
        if (!$a || !$b) return false;
        $a = strtolower($a);
        $b = strtolower($b);
        if ($a === $b) return true;
        // token overlap
        $ta = preg_split('/\s+/', $a);
        $tb = preg_split('/\s+/', $b);
        $common = array_intersect($ta, $tb);
        return count($common) > 0;
    }

    /**
     * Normalize an entry from the Odds-API into our minimal odds shape.
     */
    private function normalizeOddsApiEntry(array $entry): array
    {
        $sites = $entry['bookmakers'] ?? $entry['sites'] ?? [];

        // Collect normalized per-provider markets so the frontend can show multiple books
        $providers = [];
        foreach ($sites as $site) {
            $markets = $site['markets'] ?? [];
            $homeMoney = null; $awayMoney = null; $homeSpread = null; $awaySpread = null; $total = null;

            foreach ($markets as $m) {
                $key = strtolower($m['key'] ?? ($m['marketKey'] ?? ''));
                $outcomes = $m['outcomes'] ?? [];

                if ($key === 'h2h' || $key === 'moneyline' || str_contains($key, 'h2h') ) {
                    foreach ($outcomes as $p) {
                        if (isset($p['name']) && strtolower($p['name']) === strtolower($entry['home_team'] ?? '')) {
                            $homeMoney = $p['price'] ?? $p['point'] ?? $homeMoney;
                        }
                        if (isset($p['name']) && strtolower($p['name']) === strtolower($entry['away_team'] ?? '')) {
                            $awayMoney = $p['price'] ?? $p['point'] ?? $awayMoney;
                        }
                    }
                }

                if ($key === 'spreads' || str_contains($key, 'spread')) {
                    foreach ($outcomes as $p) {
                        if (isset($p['name']) && strtolower($p['name']) === strtolower($entry['home_team'] ?? '')) {
                            $homeSpread = $p['point'] ?? $p['price'] ?? $homeSpread;
                        }
                        if (isset($p['name']) && strtolower($p['name']) === strtolower($entry['away_team'] ?? '')) {
                            $awaySpread = $p['point'] ?? $p['price'] ?? $awaySpread;
                        }
                    }
                }

                if ($key === 'totals' || str_contains($key, 'total') || isset($m['total'])) {
                    $total = $m['total'] ?? ($outcomes[0]['point'] ?? $total);
                }
            }

            $providers[] = [
                'key' => $site['key'] ?? null,
                'title' => $site['title'] ?? $site['bookmaker'] ?? null,
                'last_update' => $site['last_update'] ?? $site['lastUpdate'] ?? null,
                'homeMoneyline' => $homeMoney,
                'awayMoneyline' => $awayMoney,
                'homeSpread' => $homeSpread,
                'awaySpread' => $awaySpread,
                'overUnder' => $total,
                'raw' => $site,
            ];
        }

        // Choose the first provider as the summary 'provider' for backward compatibility
        $primary = $providers[0] ?? null;

        return [
            'provider' => $primary['title'] ?? 'Odds-API',
            'overUnder' => $primary['overUnder'] ?? null,
            'homeMoneyline' => $primary['homeMoneyline'] ?? null,
            'awayMoneyline' => $primary['awayMoneyline'] ?? null,
            'homeSpread' => $primary['homeSpread'] ?? null,
            'awaySpread' => $primary['awaySpread'] ?? null,
            'providers' => $providers,
            'raw' => $entry,
        ];
    }

    /**
     * Public helper: get odds for a single game identified by ESPN game id.
     * Accepts optional $summary (ESPN summary payload) to avoid extra remote calls.
     */
    public function getOddsForGame(string $league, string $gameId, array $summary = null): ?array
    {
        // Build candidate from summary if provided, otherwise try to fetch summary
        if (!$summary) {
            $summary = $this->getGameSummary($league, $gameId);
        }

        if (!$summary || !isset($summary['header'])) {
            return null;
        }

        $header = $summary['header'];
        $comp = $header['competitions'][0] ?? null;
        $competitors = $comp['competitors'] ?? [];
        $home = null; $away = null;
        foreach ($competitors as $c) {
            if (($c['homeAway'] ?? '') === 'home') $home = $c;
            if (($c['homeAway'] ?? '') === 'away') $away = $c;
        }

        $candidate = [
            'id' => $gameId,
            'date' => $header['competitions'][0]['date'] ?? $header['date'] ?? null,
            'home' => $home['team']['displayName'] ?? ($home['team']['name'] ?? null),
            'away' => $away['team']['displayName'] ?? ($away['team']['name'] ?? null),
        ];

        $map = $this->fetchOddsApiForGames('basketball_nba', [$candidate]);
        return $map[$gameId] ?? null;
    }

    // Jogos finalizados (últimos X dias) de todas as ligas
    public function getFinishedGames(int $days = 3)
    {
        return Cache::remember("finished_games_{$days}", 600, function () use ($days) {
            $allGames = [];

            // Buscar jogos dos últimos dias (apenas NBA por defeito para velocidade)
            $priorityLeagues = ['nba'];

            for ($i = 0; $i < $days; $i++) {
                $date = now()->subDays($i)->format('Ymd');

                foreach ($priorityLeagues as $league) {
                    $data = $this->makeRequest($league, 'scoreboard', ['dates' => $date]);

                    if ($data && isset($data['events'])) {
                        foreach ($data['events'] as $event) {
                            // Apenas jogos finalizados
                            if (isset($event['status']['type']['completed']) &&
                                $event['status']['type']['completed'] === true) {
                                $allGames[] = $this->formatGame($event, $league);
                            }
                        }
                    }
                }
            }

            // Ordenar por data (mais recente primeiro)
            usort($allGames, function($a, $b) {
                return strtotime($b['date']) - strtotime($a['date']);
            });

            return ['response' => $allGames];
        });
    }

    // Notícias de todas as ligas
    public function getNews(?string $league = null, int $limit = 10)
    {
        $cacheKey = $league ? "news_{$league}_{$limit}" : "news_all_{$limit}";

        return Cache::remember($cacheKey, 1800, function () use ($league, $limit) {
            $allNews = [];

            // Apenas NBA para velocidade (notícias mudam menos frequentemente)
            $leaguesToFetch = $league ? [$league => $this->leagues[$league]] : ['nba' => 'NBA'];

            foreach (array_keys($leaguesToFetch) as $leagueKey) {
                $data = $this->makeRequest($leagueKey, 'news');

                if ($data && isset($data['articles'])) {
                    foreach (array_slice($data['articles'], 0, $limit) as $article) {
                        $allNews[] = [
                            'id' => $article['id'] ?? uniqid(),
                            'headline' => $article['headline'] ?? 'No headline',
                            'description' => $article['description'] ?? '',
                            'published' => $article['published'] ?? now()->toIso8601String(),
                            'link' => $article['links']['web']['href'] ?? '#',
                            'image' => $article['images'][0]['url'] ?? null,
                            'league' => $this->leagues[$leagueKey] ?? strtoupper($leagueKey),
                        ];
                    }
                }
            }

            // Ordenar por data de publicação (mais recente primeiro)
            usort($allNews, function($a, $b) {
                return strtotime($b['published']) - strtotime($a['published']);
            });

            return ['response' => array_slice($allNews, 0, $limit)];
        });
    }

    // Todas as equipas de uma liga
    public function getTeams(string $league)
    {
        return Cache::remember("teams_{$league}", 3600, function () use ($league) {
            $data = $this->makeRequest($league, 'teams');

            if (!$data || !isset($data['sports'][0]['leagues'][0]['teams'])) {
                return ['response' => []];
            }

            $teams = [];
            foreach ($data['sports'][0]['leagues'][0]['teams'] as $teamData) {
                $team = $teamData['team'];
                $teams[] = [
                    'id' => $team['id'] ?? null,
                    'name' => $team['displayName'] ?? 'Unknown Team',
                    'abbreviation' => $team['abbreviation'] ?? '',
                    'logo' => $team['logos'][0]['href'] ?? null,
                    'color' => $team['color'] ?? null,
                    'alternateColor' => $team['alternateColor'] ?? null,
                    'league' => $this->leagues[$league] ?? strtoupper($league),
                ];
            }

            return ['response' => $teams];
        });
    }

    // Equipa específica
    public function getTeam(string $league, string $teamId)
    {
        return Cache::remember("team_{$league}_{$teamId}", 3600, function () use ($league, $teamId) {
            $data = $this->makeRequest($league, "teams/{$teamId}");

            if (!$data || !isset($data['team'])) {
                return ['response' => null];
            }

            $team = $data['team'];
            return [
                'response' => [
                    'id' => $team['id'] ?? null,
                    'name' => $team['displayName'] ?? 'Unknown Team',
                    'abbreviation' => $team['abbreviation'] ?? '',
                    'location' => $team['location'] ?? '',
                    'logo' => $team['logos'][0]['href'] ?? null,
                    'color' => $team['color'] ?? null,
                    'alternateColor' => $team['alternateColor'] ?? null,
                    'record' => $team['record']['items'][0]['summary'] ?? 'N/A',
                    'standingSummary' => $team['standingSummary'] ?? 'N/A',
                    'league' => $this->leagues[$league] ?? strtoupper($league),
                    'nextEvent' => isset($team['nextEvent'][0]) ? [
                        'id' => $team['nextEvent'][0]['id'] ?? null,
                        'name' => $team['nextEvent'][0]['name'] ?? '',
                        'date' => $team['nextEvent'][0]['date'] ?? null,
                    ] : null,
                ]
            ];
        });
    }

    // Formatar jogo da ESPN para o formato esperado
    private function formatGame($event, $league)
    {
        $homeTeam = $event['competitions'][0]['competitors'][0] ?? null;
        $awayTeam = $event['competitions'][0]['competitors'][1] ?? null;

        // Garantir que home é sempre o que tem homeAway = 'home'
        if ($homeTeam && isset($homeTeam['homeAway']) && $homeTeam['homeAway'] === 'away') {
            [$homeTeam, $awayTeam] = [$awayTeam, $homeTeam];
        }

        return [
            'id' => $event['id'] ?? uniqid(),
            'date' => $event['date'] ?? now()->toIso8601String(),
            'status' => [
                'long' => $event['status']['type']['detail'] ?? 'Scheduled',
                'short' => $event['status']['type']['name'] ?? 'SCH',
            ],
            'league' => [
                'id' => $league,  // ID da liga (nba, wnba, etc) para routing
                'name' => $this->leagues[$league] ?? strtoupper($league),
                'logo' => null,
            ],
            'teams' => [
                'home' => [
                    'id' => $homeTeam['id'] ?? null,
                    'name' => $homeTeam['team']['displayName'] ?? 'Home Team',
                    'logo' => $homeTeam['team']['logo'] ?? null,
                ],
                'away' => [
                    'id' => $awayTeam['id'] ?? null,
                    'name' => $awayTeam['team']['displayName'] ?? 'Away Team',
                    'logo' => $awayTeam['team']['logo'] ?? null,
                ],
            ],
            'scores' => [
                'home' => [
                    'total' => (int) ($homeTeam['score'] ?? 0),
                ],
                'away' => [
                    'total' => (int) ($awayTeam['score'] ?? 0),
                ],
            ],
        ];
    }

    // Buscar summary completo de um jogo específico (com boxscore, estatísticas, etc)
    public function getGameSummary(string $league, string $gameId)
    {
        return Cache::remember("game_summary_{$league}_{$gameId}", 30, function () use ($league, $gameId) {
            $data = $this->makeRequest($league, "summary", ['event' => $gameId]);

            if (!$data) {
                Log::warning('ESPN API returned no data for game summary', [
                    'league' => $league,
                    'gameId' => $gameId,
                ]);
                return null;
            }

            // Log da estrutura recebida
            if (config('app.debug')) {
                Log::debug('ESPN API game summary received', [
                    'league' => $league,
                    'gameId' => $gameId,
                    'has_header' => isset($data['header']),
                    'has_boxscore' => isset($data['boxscore']),
                    'has_gameInfo' => isset($data['gameInfo']),
                    'top_level_keys' => array_keys($data),
                ]);
            }

            // Estrutura do summary da ESPN:
            // - header: informações básicas do jogo
            // - boxscore: estatísticas por jogador
            // - gameInfo: informações adicionais
            // - standings: classificação (se disponível)

            $header = $data['header'] ?? null;
            $boxscore = $data['boxscore'] ?? null;
            $gameInfo = $data['gameInfo'] ?? null;

            return [
                'header' => $header,
                'boxscore' => $boxscore,
                'gameInfo' => $gameInfo,
                'raw' => $data, // Para debug
            ];
        });
    }

    // Removed unused getGame() and placeholder getTopPlayers() methods

    /**
     * Aggregate top players over the last N days based on total points (with assists/rebounds included).
     * Returns a plain array of players: [{ id, fullName, team, points, assists, rebounds }].
     */
    public function getTopPlayersWeek(?string $league = 'nba', int $days = 7, int $limit = 10)
    {
        $leagueKey = $league ?: 'nba';
    // Allow broader ranges (up to ~season) so frontend range selector (30/180) works
    $days = max(1, min($days, 180));
        $limit = max(1, min($limit, 25));

        $cacheKey = "top_players_{$leagueKey}_{$days}_{$limit}";

        return Cache::remember($cacheKey, 600, function () use ($leagueKey, $days, $limit) {
            $playersMap = [];

            for ($i = 0; $i < $days; $i++) {
                $date = now()->subDays($i)->format('Ymd');
                $scoreboard = $this->makeRequest($leagueKey, 'scoreboard', ['dates' => $date]);

                if (!$scoreboard || !isset($scoreboard['events'])) {
                    continue;
                }

                foreach ($scoreboard['events'] as $event) {
                    // Only completed games
                    if (!isset($event['status']['type']['completed']) || $event['status']['type']['completed'] !== true) {
                        continue;
                    }

                    $gameId = $event['id'] ?? null;
                    if (!$gameId) continue;

                    $summary = $this->makeRequest($leagueKey, 'summary', ['event' => $gameId]);
                    if (!$summary || !isset($summary['boxscore']['players'])) {
                        continue;
                    }

                    $teamsPlayers = $summary['boxscore']['players'];
                    foreach ($teamsPlayers as $teamBlock) {
                        $teamName = $teamBlock['team']['displayName'] ?? '';
                        $teamLogo = $teamBlock['team']['logo']
                            ?? ($teamBlock['team']['logos'][0]['href'] ?? null);
                        $statisticsBlocks = $teamBlock['statistics'] ?? [];
                        if (empty($statisticsBlocks)) continue;

                        // ESPN provides labels per statistics block; commonly the first has PTS/REB/AST mappings
                        $labels = $statisticsBlocks[0]['labels'] ?? [];
                        $athletes = $statisticsBlocks[0]['athletes'] ?? [];

                        foreach ($athletes as $athleteRow) {
                            $athlete = $athleteRow['athlete'] ?? [];
                            $name = $athlete['displayName'] ?? ($athlete['fullName'] ?? null);
                            if (!$name) continue;

                            $id = $athlete['id'] ?? $name;
                            $statsValues = $athleteRow['stats'] ?? [];

                            // Try to resolve headshot/image
                            $image = $athlete['headshot']['href']
                                ?? ($athlete['images'][0]['href'] ?? null)
                                ?? ($athlete['images'][0]['url'] ?? null)
                                ?? ($athlete['photo']['href'] ?? null)
                                ?? null;

                            // Map labels -> values safely
                            $lookup = [];
                            if (is_array($labels) && is_array($statsValues) && count($labels) === count($statsValues)) {
                                $lookup = array_combine($labels, $statsValues);
                            }

                            $pts = isset($lookup['PTS']) ? (int) $lookup['PTS'] : (int) ($athleteRow['points'] ?? 0);
                            $reb = isset($lookup['REB']) ? (int) $lookup['REB'] : (int) ($athleteRow['rebounds'] ?? 0);
                            $ast = isset($lookup['AST']) ? (int) $lookup['AST'] : (int) ($athleteRow['assists'] ?? 0);

                            if (!isset($playersMap[$id])) {
                                $playersMap[$id] = [
                                    'id' => (string) $id,
                                    'fullName' => $name,
                                    'team' => $teamName,
                                    'image' => $image ?? $teamLogo,
                                    'points' => 0,
                                    'assists' => 0,
                                    'rebounds' => 0,
                                ];
                            } else {
                                // Backfill image/team if missing
                                if (empty($playersMap[$id]['image']) && ($image || $teamLogo)) {
                                    $playersMap[$id]['image'] = $image ?? $teamLogo;
                                }
                                if (empty($playersMap[$id]['team']) && $teamName) {
                                    $playersMap[$id]['team'] = $teamName;
                                }
                            }

                            $playersMap[$id]['points'] += $pts;
                            $playersMap[$id]['assists'] += $ast;
                            $playersMap[$id]['rebounds'] += $reb;
                        }
                    }
                }
            }

            $players = array_values($playersMap);
            usort($players, function ($a, $b) {
                return ($b['points'] <=> $a['points'])
                    ?: ($b['rebounds'] <=> $a['rebounds'])
                    ?: ($b['assists'] <=> $a['assists']);
            });

            return array_slice($players, 0, $limit);
        });
    }

    /**
     * Obter detalhes completos de um jogador específico
     */
    public function getPlayerDetails(string $league, string $playerId)
    {
        return Cache::remember("player_{$league}_{$playerId}", 3600, function () use ($league, $playerId) {
            // A ESPN não tem endpoint direto de jogador, então vamos buscar do summary dos últimos jogos
            $playerStats = [];
            $playerInfo = null;
            $recentGames = [];

            // Buscar apenas dos últimos 7 dias para velocidade (em vez de 30)
            for ($i = 0; $i < 7; $i++) {
                $date = now()->subDays($i)->format('Ymd');
                $scoreboard = $this->makeRequest($league, 'scoreboard', ['dates' => $date]);

                if (!$scoreboard || !isset($scoreboard['events'])) {
                    continue;
                }

                foreach ($scoreboard['events'] as $event) {
                    if (!isset($event['status']['type']['completed']) || $event['status']['type']['completed'] !== true) {
                        continue;
                    }

                    $gameId = $event['id'] ?? null;
                    if (!$gameId) continue;

                    $summary = $this->makeRequest($league, 'summary', ['event' => $gameId]);
                    if (!$summary || !isset($summary['boxscore']['players'])) {
                        continue;
                    }

                    foreach ($summary['boxscore']['players'] as $teamBlock) {
                        $teamName = $teamBlock['team']['displayName'] ?? '';
                        $teamLogo = $teamBlock['team']['logo'] ?? ($teamBlock['team']['logos'][0]['href'] ?? null);
                        $statisticsBlocks = $teamBlock['statistics'] ?? [];

                        if (empty($statisticsBlocks)) continue;

                        $labels = $statisticsBlocks[0]['labels'] ?? [];
                        $athletes = $statisticsBlocks[0]['athletes'] ?? [];

                        foreach ($athletes as $athleteRow) {
                            $athlete = $athleteRow['athlete'] ?? [];
                            $id = (string)($athlete['id'] ?? null);

                            if ($id == $playerId) {
                                // Encontrámos o jogador!
                                if (!$playerInfo) {
                                    $playerInfo = [
                                        'id' => $id,
                                        'name' => $athlete['displayName'] ?? ($athlete['fullName'] ?? 'Unknown'),
                                        'team' => $teamName,
                                        'teamLogo' => $teamLogo,
                                        'image' => $athlete['headshot']['href']
                                            ?? ($athlete['images'][0]['href'] ?? null)
                                            ?? ($athlete['photo']['href'] ?? null)
                                            ?? $teamLogo,
                                        'position' => $athlete['position']['abbreviation'] ?? 'N/A',
                                        'jersey' => $athlete['jersey'] ?? null,
                                    ];
                                }

                                $statsValues = $athleteRow['stats'] ?? [];
                                $lookup = [];
                                if (is_array($labels) && is_array($statsValues) && count($labels) === count($statsValues)) {
                                    $lookup = array_combine($labels, $statsValues);
                                }

                                // Adicionar estatísticas deste jogo
                                $recentGames[] = [
                                    'date' => $event['date'] ?? null,
                                    'opponent' => $event['competitions'][0]['competitors'][0]['team']['displayName'] ?? 'Unknown',
                                    'stats' => $lookup,
                                ];

                                // Acumular estatísticas totais
                                foreach ($lookup as $stat => $value) {
                                    if (!isset($playerStats[$stat])) {
                                        $playerStats[$stat] = 0;
                                    }
                                    $playerStats[$stat] += is_numeric($value) ? (float)$value : 0;
                                }
                            }
                        }
                    }
                }

                // Limitar a 5 jogos para não sobrecarregar
                if (count($recentGames) >= 5) {
                    break;
                }
            }

            if (!$playerInfo) {
                return null;
            }

            // Calcular médias
            $gamesPlayed = count($recentGames);
            $averages = [];
            foreach ($playerStats as $stat => $total) {
                $averages[$stat] = $gamesPlayed > 0 ? round($total / $gamesPlayed, 1) : 0;
            }

            return [
                'info' => $playerInfo,
                'averages' => $averages,
                'totals' => $playerStats,
                'recentGames' => array_slice($recentGames, 0, 5),
                'gamesPlayed' => $gamesPlayed,
            ];
        });
    }

    // Ligas disponíveis
    public function getLeagues()
    {
        return [
            'response' => array_map(function($key, $name) {
                return [
                    'id' => $key,
                    'name' => $name,
                    'type' => 'League',
                ];
            }, array_keys($this->leagues), array_values($this->leagues))
        ];
    }

    /**
     * Extract a list of injured / not-playing players for a given team from a game summary
     * returns array of [{id, name, status, reason?}]
     */
    public function getTeamInjuries(string $league, string $teamId, array $summary = null)
    {
        // Accept an optional pre-fetched summary to avoid extra requests
        if ($summary === null) {
            // Try to find a recent game for the team to inspect roster statuses (last 3 days)
            for ($i = 0; $i < 3; $i++) {
                $date = now()->subDays($i)->format('Ymd');
                $scoreboard = $this->makeRequest($league, 'scoreboard', ['dates' => $date]);
                if (!$scoreboard || !isset($scoreboard['events'])) continue;
                foreach ($scoreboard['events'] as $event) {
                    $s = $this->makeRequest($league, 'summary', ['event' => $event['id'] ?? null]);
                    if ($s && isset($s['boxscore']['players'])) {
                        $summary = $s;
                        break 2;
                    }
                }
            }
        }

        if (!$summary) {
            return [];
        }

        $injuries = [];

        // 1) Inspect boxscore athlete rows for status/injury flags
        if (isset($summary['boxscore']['players']) && is_array($summary['boxscore']['players'])) {
            foreach ($summary['boxscore']['players'] as $teamBlock) {
                $team = $teamBlock['team'] ?? [];
                if ((string)($team['id'] ?? '') !== (string)$teamId) continue;

                $statisticsBlocks = $teamBlock['statistics'] ?? [];
                foreach ($statisticsBlocks as $statBlock) {
                    $athletes = $statBlock['athletes'] ?? [];
                    foreach ($athletes as $athleteRow) {
                        $athlete = $athleteRow['athlete'] ?? [];

                        $didNotPlay = $athleteRow['didNotPlay'] ?? null;
                        $rowReason = $athleteRow['reason'] ?? null;
                        $rowActive = $athleteRow['active'] ?? null;

                        $status = $athlete['status'] ?? ($athleteRow['status'] ?? null);
                        $injury = $athlete['injury'] ?? ($athlete['injuryStatus'] ?? null);

                        $isUnavailable = false;
                        $derivedStatus = null;
                        $derivedReason = null;

                        if ($didNotPlay === true) {
                            $isUnavailable = true;
                            $derivedStatus = 'Did Not Play';
                            $derivedReason = $rowReason ?? $derivedReason;
                        }

                        if ($rowActive !== null && $rowActive === false) {
                            $isUnavailable = true;
                            $derivedStatus = $derivedStatus ?? 'Coach\'s Decision';
                        }

                        if ($status) {
                            $isUnavailable = true;
                            $derivedStatus = $derivedStatus ?? $status;
                        }

                        if ($injury) {
                            $isUnavailable = true;
                            if (is_array($injury)) {
                                $derivedStatus = $derivedStatus ?? ($injury['status'] ?? 'INJURY');
                                $derivedReason = $derivedReason ?? ($injury['detail'] ?? null);
                            } else {
                                $derivedStatus = $derivedStatus ?? $injury;
                            }
                        }

                        // fallback: top-level injuries array that links athlete -> team
                        if (!$isUnavailable && isset($summary['injuries']) && is_array($summary['injuries'])) {
                            foreach ($summary['injuries'] as $inj) {
                                $injTeam = $inj['team'] ?? ($inj['teamId'] ?? null);
                                $injAth = $inj['athlete'] ?? null;
                                $injTeamId = is_array($injTeam) ? ($injTeam['id'] ?? ($injTeam['teamId'] ?? null)) : $injTeam;
                                $injId = is_array($injAth) ? ($injAth['id'] ?? null) : $injAth;

                                if ($injTeamId && (string)$injTeamId === (string)$teamId) {
                                    if ($injId && isset($athlete['id']) && (string)$injId === (string)$athlete['id']) {
                                        $isUnavailable = true;
                                        $derivedReason = $derivedReason ?? ($inj['description'] ?? ($inj['note'] ?? null));
                                        $derivedStatus = $derivedStatus ?? ($inj['status'] ?? ($inj['type']['description'] ?? 'INJURY'));
                                        break;
                                    }
                                }
                            }
                        }

                        if ($isUnavailable) {
                            $injuries[] = [
                                'id' => (string)($athlete['id'] ?? $athlete['displayName'] ?? ''),
                                'name' => $athlete['displayName'] ?? ($athlete['fullName'] ?? 'Unknown'),
                                'status' => $derivedStatus ?? 'unknown',
                                'reason' => $derivedReason ?? $rowReason ?? null,
                            ];
                        }
                    }
                }
            }
        }

        // 2) If none found, check top-level injuries grouped by team
        if (empty($injuries) && isset($summary['injuries']) && is_array($summary['injuries'])) {
            foreach ($summary['injuries'] as $teamInj) {
                $injTeam = $teamInj['team'] ?? ($teamInj['teamId'] ?? null);
                $injTeamId = is_array($injTeam) ? ($injTeam['id'] ?? ($injTeam['teamId'] ?? null)) : $injTeam;
                if (!$injTeamId || (string)$injTeamId !== (string)$teamId) continue;

                $inner = $teamInj['injuries'] ?? $teamInj['players'] ?? [];
                foreach ($inner as $entry) {
                    $ath = $entry['athlete'] ?? null;
                    $aid = $ath['id'] ?? null;
                    if (!$aid) continue;

                    $derivedStatus = $entry['type']['description'] ?? $entry['status'] ?? ($entry['type']['name'] ?? 'INJURY');
                    $derivedReason = $entry['details']['type'] ?? $entry['details']['displayDescription'] ?? ($entry['details']['fantasyStatus']['description'] ?? null) ?? null;

                    $injuries[] = [
                        'id' => (string)$aid,
                        'name' => $ath['displayName'] ?? ($ath['fullName'] ?? 'Unknown'),
                        'status' => $derivedStatus,
                        'reason' => $derivedReason,
                    ];
                }
            }
        }

        return $injuries;
    }

    /**
     * Get recent results (W/L) for a team by scanning past scoreboard days
     * Returns array of [{date, opponentName, teamScore, oppScore, result}]
     */
    public function getTeamRecentResults(string $league, string $teamId, int $limit = 5, array $summary = null)
    {
        $results = [];
        $daysScanned = 0;
        $maxDays = 30; // avoid too long loops
        $chunkSize = 5; // fetch 5 days at a time in parallel

        // If a summary is provided, prefer scanning backwards from the game's date
        $baseDate = null;
        if ($summary) {
            $header = $summary['header'] ?? null;
            $comp = $header['competitions'][0] ?? null;
            $baseDate = isset($comp['date']) ? \Carbon\Carbon::parse($comp['date']) : null;
        }
        while (count($results) < $limit && $daysScanned < $maxDays) {
            $dates = [];
            for ($i = 0; $i < $chunkSize && ($daysScanned + $i) < $maxDays; $i++) {
                if ($baseDate) {
                    $dates[] = $baseDate->copy()->subDays($daysScanned + $i)->format('Ymd');
                } else {
                    $dates[] = now()->subDays($daysScanned + $i)->format('Ymd');
                }
            }

            $scoreboards = $this->fetchScoreboardsForDates($league, $dates);
            $daysScanned += count($dates);

            foreach ($scoreboards as $scoreboard) {
                if (!$scoreboard || !isset($scoreboard['events'])) continue;

                foreach ($scoreboard['events'] as $event) {
                    // Only finished games
                    if (!isset($event['status']['type']['completed']) || $event['status']['type']['completed'] !== true) continue;
                    $comps = $event['competitions'][0] ?? null;
                    if (!$comps || !isset($comps['competitors'])) continue;
                    $competitors = $comps['competitors'];
                    $found = null;
                    $opp = null;
                    foreach ($competitors as $c) {
                        if ((string)($c['team']['id'] ?? '') === (string)$teamId) {
                            $found = $c;
                        } else {
                            $opp = $c;
                        }
                    }
                    if (!$found) continue;

                    $teamScore = (int)($found['score'] ?? 0);
                    $oppScore = (int)($opp['score'] ?? 0);
                    $results[] = [
                        'date' => $event['date'] ?? null,
                        'opponent' => $opp['team']['displayName'] ?? 'Unknown',
                        'teamScore' => $teamScore,
                        'oppScore' => $oppScore,
                        'result' => $teamScore > $oppScore ? 'W' : ($teamScore < $oppScore ? 'L' : 'D'),
                    ];

                    if (count($results) >= $limit) break 3;
                }
            }
        }

        return array_slice($results, 0, $limit);
    }

    /**
     * Head to head between two teams: last N matches where both teams faced each other
     */
    public function getHeadToHead(string $league, string $teamAId, string $teamBId, int $limit = 5, array $summary = null)
    {
        $matches = [];
        $daysScanned = 0;
        $maxDays = 180; // allow longer lookback but bounded
        $chunkSize = 7; // fetch a week's scoreboard at a time

        // If a summary is provided, try to use its date as the scan anchor so we search the appropriate window
        $baseDate = null;
        if ($summary) {
            $header = $summary['header'] ?? null;
            $comp = $header['competitions'][0] ?? null;
            $baseDate = isset($comp['date']) ? \Carbon\Carbon::parse($comp['date']) : null;
        }

        while (count($matches) < $limit && $daysScanned < $maxDays) {
            $dates = [];
            for ($i = 0; $i < $chunkSize && ($daysScanned + $i) < $maxDays; $i++) {
                if ($baseDate) {
                    $dates[] = $baseDate->copy()->subDays($daysScanned + $i)->format('Ymd');
                } else {
                    $dates[] = now()->subDays($daysScanned + $i)->format('Ymd');
                }
            }

            $scoreboards = $this->fetchScoreboardsForDates($league, $dates);
            $daysScanned += count($dates);

            foreach ($scoreboards as $scoreboard) {
                if (!$scoreboard || !isset($scoreboard['events'])) continue;

                foreach ($scoreboard['events'] as $event) {
                    if (!isset($event['status']['type']['completed']) || $event['status']['type']['completed'] !== true) continue;
                    $comps = $event['competitions'][0] ?? null;
                    if (!$comps || !isset($comps['competitors'])) continue;
                    $competitors = $comps['competitors'];
                    $ids = array_map(function ($c) { return (string)($c['team']['id'] ?? ''); }, $competitors);
                    if (in_array((string)$teamAId, $ids) && in_array((string)$teamBId, $ids)) {
                        // find each team block
                        $a = null; $b = null;
                        foreach ($competitors as $c) {
                            if ((string)($c['team']['id'] ?? '') === (string)$teamAId) $a = $c;
                            if ((string)($c['team']['id'] ?? '') === (string)$teamBId) $b = $c;
                        }
                        if (!$a || !$b) continue;
                        $matches[] = [
                            'date' => $event['date'] ?? null,
                            'teamA' => $a['team']['displayName'] ?? null,
                            'teamAScore' => (int)($a['score'] ?? 0),
                            'teamB' => $b['team']['displayName'] ?? null,
                            'teamBScore' => (int)($b['score'] ?? 0),
                        ];
                        if (count($matches) >= $limit) break 3;
                    }
                }
            }
        }

        return $matches;
    }

    /**
     * Try to fetch standings for a league. Prefer dedicated 'standings' endpoint, fallback to 'teams' lookup
     */
    public function getStandings(string $league, array $summary = null)
    {
        $cacheKey = "standings_{$league}";
        return Cache::remember($cacheKey, 300, function () use ($league) {
            $standings = $this->makeRequest($league, 'standings', []);
            if ($standings && isset($standings['records'])) {
                return $standings['records'];
            }

            // fallback: try teams endpoint which sometimes contains record info
            $teams = $this->makeRequest($league, 'teams', []);
            if ($teams && isset($teams['teams'])) {
                return array_map(function ($t) {
                    return [
                        'team' => $t['team'] ?? $t,
                        'record' => $t['record'] ?? null,
                    ];
                }, $teams['teams']);
            }

            return null;
        });
    }

    /**
     * Fetch multiple scoreboard endpoints in parallel for given dates.
     * Returns an array of scoreboard payloads in the same order as $dates.
     */
    private function fetchScoreboardsForDates(string $league, array $dates): array
    {
        $results = [];
        $toFetch = [];
        $keys = [];

        foreach ($dates as $date) {
            $params = ['dates' => $date];
            $cacheKey = 'espn_' . $league . '_scoreboard_' . md5(json_encode($params));
            if (Cache::has($cacheKey)) {
                $results[] = Cache::get($cacheKey);
            } else {
                $toFetch[] = ['date' => $date, 'cacheKey' => $cacheKey];
            }
        }

        if (!empty($toFetch)) {
            // Build pool of requests
            $url = "{$this->espnBaseUrl}/{$league}/scoreboard";
            $fetchedMap = [];
            try {
                $poolResponses = HttpClient::pool(function ($pool) use ($toFetch, $url) {
                    $calls = [];
                    foreach ($toFetch as $req) {
                        $calls[] = $pool->get($url, ['dates' => $req['date']]);
                    }
                    return $calls;
                });

                // poolResponses preserved in same order as toFetch
                foreach ($poolResponses as $idx => $resp) {
                    $date = $toFetch[$idx]['date'];
                    $cacheKey = $toFetch[$idx]['cacheKey'];
                    if (is_object($resp) && method_exists($resp, 'successful') && $resp->successful()) {
                        $data = $resp->json();
                        try { Cache::put($cacheKey, $data, 30); } catch (\Exception $e) { Log::warning('Failed cache write for scoreboard', ['key' => $cacheKey]); }
                        $fetchedMap[$date] = $data;
                    } elseif ($resp instanceof \Throwable) {
                        Log::warning('Scoreboard fetch exception', ['date' => $date, 'error' => $resp->getMessage()]);
                        $fetchedMap[$date] = null;
                    } else {
                        // non-successful response
                        $fetchedMap[$date] = null;
                    }
                }
            } catch (\Throwable $e) {
                Log::warning('Scoreboard pool failed', ['error' => $e->getMessage()]);
                // mark all as null
                foreach ($toFetch as $req) {
                    $fetchedMap[$req['date']] = null;
                }
            }

            // append fetched results to results array as per original ordering handled later
            foreach ($toFetch as $req) {
                $results[] = $fetchedMap[$req['date']] ?? null;
            }
        }

        // Ensure results are returned in the same order as input dates
        // We collected cached results first then fetched ones appended; reorder accordingly
        $ordered = [];
        foreach ($dates as $date) {
            // find first entry in results that matches this date's scoreboard (by presence of events with matching date) - best-effort
            $found = null;
            foreach ($results as $r) {
                if ($r === null) continue;
                // quick heuristic: check if any event has the requested date string
                $matched = false;
                if (isset($r['events']) && is_array($r['events'])) {
                    foreach ($r['events'] as $ev) {
                        if (isset($ev['date']) && strpos($ev['date'], substr($date, 0, 4)) !== false) { $matched = true; break; }
                    }
                }
                if ($matched || !$found) { $found = $r; break; }
            }
            $ordered[] = $found;
        }

        return $ordered;
    }
}
