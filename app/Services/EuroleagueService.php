<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EuroleagueService
{
    private string $apiBaseUrl = 'https://api-live.euroleague.net/v2';
    private string $currentSeason = 'E2025'; // EuroLeague 2025-26

    // Competições disponíveis na API
    private array $competitions = [
        'E' => 'EuroLeague',
        'U' => 'EuroCup',
    ];

    public function getTeams(?string $country = null)
    {
        $cacheKey = 'euroleague_teams_api_' . ($country ?? 'all');

        return Cache::remember($cacheKey, 3600, function () use ($country) {
            try {
                $teamsMap = [];

                // Buscar equipas de todas as competições (EuroLeague + EuroCup)
                foreach ($this->competitions as $compCode => $compName) {
                    $season = $compCode . '2025';

                    $response = Http::timeout(10)
                        ->withHeaders(['Accept' => 'application/json'])
                        ->get("{$this->apiBaseUrl}/competitions/{$compCode}/seasons/{$season}/games");

                    if (!$response->successful()) {
                        Log::warning("Failed to fetch {$compName} data");
                        continue;
                    }

                    $games = $response->json('data', []);

                    // Extrair equipas únicas dos jogos
                    foreach ($games as $game) {
                        if (isset($game['local']['club'])) {
                            $club = $game['local']['club'];
                            $clubId = $compCode . '_' . $club['code'];

                            if (!isset($teamsMap[$clubId])) {
                                $teamsMap[$clubId] = [
                                    'id' => $clubId,
                                    'name' => $club['name'],
                                    'abbreviation' => $club['abbreviatedName'] ?? $club['code'],
                                    'logo' => $club['images']['crest'] ?? null,
                                    'color' => $this->getColorByCountry($this->getCountryFromTeamName($club['name'])),
                                    'alternateColor' => 'FF6C00',
                                    'league' => $compName,
                                    'city' => $this->getCityFromTeamName($club['name']),
                                    'country' => $this->getCountryFromTeamName($club['name']),
                                    'conference' => null,
                                    'division' => null,
                                ];
                            }
                        }

                        if (isset($game['road']['club'])) {
                            $club = $game['road']['club'];
                            $clubId = $compCode . '_' . $club['code'];

                            if (!isset($teamsMap[$clubId])) {
                                $teamsMap[$clubId] = [
                                    'id' => $clubId,
                                    'name' => $club['name'],
                                    'abbreviation' => $club['abbreviatedName'] ?? $club['code'],
                                    'logo' => $club['images']['crest'] ?? null,
                                    'color' => $this->getColorByCountry($this->getCountryFromTeamName($club['name'])),
                                    'alternateColor' => 'FF6C00',
                                    'league' => $compName,
                                    'city' => $this->getCityFromTeamName($club['name']),
                                    'country' => $this->getCountryFromTeamName($club['name']),
                                    'conference' => null,
                                    'division' => null,
                                ];
                            }
                        }
                    }
                }

                $teams = collect(array_values($teamsMap));

                // Filtrar por país se especificado
                if ($country) {
                    $teams = $teams->filter(function ($team) use ($country) {
                        return strtolower($team['country']) === strtolower($country);
                    });
                }

                return ['response' => $teams->sortBy('name')->values()->toArray()];

            } catch (\Exception $e) {
                Log::error('Euroleague API error: ' . $e->getMessage());
                return ['response' => []];
            }
        });
    }

    private function getCountryFromTeamName(string $name): string
    {
        $patterns = [
            // Spain
            '/Madrid|Barcelona|Valencia|Vitoria|Baskonia|Manresa|Murcia|Gran Canaria|Tenerife|Joventut/i' => 'Spain',

            // Greece
            '/Piraeus|Athens|Olympiacos|Panathinaikos|Thessaloniki|Panionios|Aris|PAOK/i' => 'Greece',

            // Turkey
            '/Istanbul|Ankara|Fenerbahce|Galatasaray|Anadolu|Efes|Bahcesehir|Besiktas|Turk Telekom/i' => 'Turkey',

            // Israel
            '/Tel Aviv|Jerusalem|Maccabi|Hapoel/i' => 'Israel',

            // Lithuania
            '/Kaunas|Klaipeda|Panevezys|Zalgiris|Neptunas|Lietkabelis/i' => 'Lithuania',

            // Italy
            '/Milan|Milano|Bologna|Virtus|Olimpia|Venice|Venezia|Trento|Brescia|Sassari/i' => 'Italy',

            // Germany
            '/Munich|Bayern|Berlin|ALBA|Hamburg|Ulm|Chemnitz|NINERS|Bonn|Oldenburg/i' => 'Germany',

            // Serbia
            '/Belgrade|Partizan|Crvena Zvezda|Red Star/i' => 'Serbia',

            // France
            '/Paris|Lyon|Bourg|Monaco|ASVEL|Villeurbanne|Le Mans/i' => 'France',

            // Slovenia
            '/Ljubljana|Cedevita|Olimpija/i' => 'Slovenia',

            // Romania
            '/Cluj|Napoca|Bucharest/i' => 'Romania',

            // Poland
            '/Wroclaw|Slask|Warsaw|Gdansk/i' => 'Poland',

            // England
            '/London|Lions/i' => 'England',

            // Montenegro
            '/Podgorica|Buducnost/i' => 'Montenegro',

            // Other countries
            '/Valencia Basket/i' => 'Spain',
            '/AS Monaco/i' => 'Monaco',
        ];

        foreach ($patterns as $pattern => $country) {
            if (preg_match($pattern, $name)) {
                return $country;
            }
        }

        // Se não encontrar, tentar extrair do nome
        Log::warning("Country not found for team: {$name}");
        return 'Unknown';
    }

    private function getCityFromTeamName(string $name): string
    {
        $parts = explode(' ', $name);
        return $parts[count($parts) - 1] ?? '';
    }

    private function getColorByCountry(string $country): string
    {
        $colors = [
            'Spain' => 'FFC629',
            'Greece' => '0D5EAF',
            'Turkey' => 'E30A17',
            'Israel' => '0038B8',
            'Lithuania' => 'FDB913',
            'Italy' => '009246',
            'Monaco' => 'CE1126',
            'Germany' => 'FFCE00',
            'Serbia' => 'C6363C',
            'France' => '0055A4',
            'Slovenia' => '005DA4',
            'Romania' => 'FCD116',
            'Poland' => 'DC143C',
            'England' => 'C8102E',
            'Montenegro' => 'D4AF37',
            'Unknown' => '666666',
        ];

        return $colors[$country] ?? '003399';
    }


    public function getCountries()
    {
        try {
            $teamsData = $this->getTeams();
            return collect($teamsData['response'] ?? [])
                ->pluck('country')
                ->unique()
                ->filter()
                ->sort()
                ->values()
                ->toArray();
        } catch (\Exception $e) {
            return [];
        }
    }

    public function getTeam(string $teamId)
    {
        $teamsData = $this->getTeams();
        $team = collect($teamsData['response'] ?? [])->firstWhere('id', $teamId);

        if (!$team) {
            return ['response' => null];
        }

        return ['response' => $team];
    }

    public function getGames(int $days = 7)
    {
        return Cache::remember("euroleague_games_api_{$days}", 1800, function () use ($days) {
            try {
                $response = Http::timeout(10)
                    ->withHeaders(['Accept' => 'application/json'])
                    ->get("{$this->apiBaseUrl}/competitions/E/seasons/{$this->currentSeason}/games");

                $upcomingGames = [];
                if ($response->successful()) {
                    $allGames = $response->json('data', []);
                    $now = now();
                    $endDate = now()->addDays($days);
                    $countTotal = count($allGames);
                    $countUpcoming = 0;
                    foreach ($allGames as $game) {
                        $gameDate = \Carbon\Carbon::parse($game['date']);
                        if ($gameDate->between($now, $endDate) && !$game['played']) {
                            $upcomingGames[] = [
                                'id' => $game['identifier'],
                                'league' => ['id' => 'euroleague', 'name' => 'EuroLeague'],
                                'date' => $gameDate->toIso8601String(),
                                'status' => 'scheduled',
                                'teams' => [
                                    'home' => [
                                        'id' => $game['local']['club']['code'],
                                        'name' => $game['local']['club']['name'],
                                        'logo' => $game['local']['club']['images']['crest'] ?? null,
                                        'score' => $game['local']['score'] ?? null,
                                    ],
                                    'away' => [
                                        'id' => $game['road']['club']['code'],
                                        'name' => $game['road']['club']['name'],
                                        'logo' => $game['road']['club']['images']['crest'] ?? null,
                                        'score' => $game['road']['score'] ?? null,
                                    ],
                                ],
                            ];
                            $countUpcoming++;
                        }
                    }
                    Log::info('EuroleagueService::getGames', [
                        'total_games_from_api' => $countTotal,
                        'upcoming_games_found' => $countUpcoming,
                        'days' => $days
                    ]);
                }

                return ['response' => $upcomingGames];

            } catch (\Exception $e) {
                Log::error('Euroleague games API error: ' . $e->getMessage());
                return ['response' => []];
            }
        });
    }

    public function getFinishedGames(int $days = 30)
    {
        return Cache::remember("euroleague_finished_games_{$days}", 600, function () use ($days) {
            try {
                $response = Http::timeout(10)
                    ->withHeaders(['Accept' => 'application/json'])
                    ->get("{$this->apiBaseUrl}/competitions/E/seasons/{$this->currentSeason}/games");

                if (!$response->successful()) {
                    Log::warning('Euroleague API não respondeu com sucesso');
                    return ['response' => []];
                }

                $allGames = $response->json('data', []);
                Log::info('Euroleague DEBUG: Dump de todos os jogos', [
                    'total' => count($allGames),
                    'exemplo' => isset($allGames[0]) ? $allGames[0] : null,
                ]);
                $finishedGames = [];
                $now = now();
                $startDate = now()->subDays($days);

                $debugCount = 0;
                foreach ($allGames as $game) {
                    $gameDate = \Carbon\Carbon::parse($game['date']);
                    // Novo filtro: jogos com scores e data no passado
                    if (
                        $gameDate->between($startDate, $now) &&
                        isset($game['local']['score']) && isset($game['road']['score']) &&
                        is_numeric($game['local']['score']) && is_numeric($game['road']['score'])
                    ) {
                        $finishedGames[] = [
                            'id' => $game['identifier'],
                            'league' => ['id' => 'euroleague', 'name' => 'EuroLeague'],
                            'date' => $gameDate->toIso8601String(),
                            'status' => $game['gameStatus'] ?? 'post',
                            'teams' => [
                                'home' => [
                                    'id' => $game['local']['club']['code'],
                                    'name' => $game['local']['club']['name'],
                                    'logo' => $game['local']['club']['images']['crest'] ?? null,
                                    'score' => $game['local']['score'] ?? null,
                                ],
                                'away' => [
                                    'id' => $game['road']['club']['code'],
                                    'name' => $game['road']['club']['name'],
                                    'logo' => $game['road']['club']['images']['crest'] ?? null,
                                    'score' => $game['road']['score'] ?? null,
                                ],
                            ],
                            'scores' => [
                                'home' => ['total' => $game['local']['score'] ?? 0],
                                'away' => ['total' => $game['road']['score'] ?? 0],
                            ],
                        ];
                        $debugCount++;
                    }
                }

                Log::info('Euroleague DEBUG: Jogos finalizados encontrados', [
                    'count' => $debugCount,
                    'ids' => array_column($finishedGames, 'id'),
                ]);

                // Ordenar por data (mais recente primeiro)
                usort($finishedGames, function($a, $b) {
                    return strtotime($b['date']) - strtotime($a['date']);
                });

                return [
                    'response' => $finishedGames,
                    'debug_total_games' => count($allGames),
                ];

            } catch (\Exception $e) {
                Log::error('Euroleague finished games API error: ' . $e->getMessage());
                return ['response' => []];
            }
        });
    }

    public function getLiveGames()
    {
        return Cache::remember('euroleague_live_games', 60, function () {
            try {
                $response = Http::timeout(10)
                    ->withHeaders(['Accept' => 'application/json'])
                    ->get("{$this->apiBaseUrl}/competitions/E/seasons/{$this->currentSeason}/games");

                if (!$response->successful()) {
                    return ['response' => []];
                }

                $allGames = $response->json('data', []);
                $liveGames = [];

                foreach ($allGames as $game) {
                    if ($game['played'] === false && $game['gameStatus'] === 'Live') {
                        $liveGames[] = [
                            'id' => $game['identifier'],
                            'league' => ['id' => 'euroleague', 'name' => 'EuroLeague'],
                            'date' => $game['date'],
                            'status' => 'in',
                            'teams' => [
                                'home' => [
                                    'id' => $game['local']['club']['code'],
                                    'name' => $game['local']['club']['name'],
                                    'logo' => $game['local']['club']['images']['crest'] ?? null,
                                    'score' => $game['local']['score'] ?? null,
                                ],
                                'away' => [
                                    'id' => $game['road']['club']['code'],
                                    'name' => $game['road']['club']['name'],
                                    'logo' => $game['road']['club']['images']['crest'] ?? null,
                                    'score' => $game['road']['score'] ?? null,
                                ],
                            ],
                        ];
                    }
                }

                return ['response' => $liveGames];

            } catch (\Exception $e) {
                Log::error('Euroleague live games API error: ' . $e->getMessage());
                return ['response' => []];
            }
        });
    }

    public function getGameDetails(string $gameId)
    {
        return Cache::remember("euroleague_game_details_{$gameId}", 600, function () use ($gameId) {
            try {
                // Buscar todos os jogos da temporada
                $response = Http::timeout(10)
                    ->withHeaders(['Accept' => 'application/json'])
                    ->get("{$this->apiBaseUrl}/competitions/E/seasons/{$this->currentSeason}/games");

                if (!$response->successful()) {
                    return null;
                }

                $allGames = $response->json('data', []);

                // Procurar o jogo específico
                $gameData = null;
                foreach ($allGames as $game) {
                    if ($game['identifier'] === $gameId) {
                        $gameData = $game;
                        break;
                    }
                }

                if (!$gameData) {
                    return null;
                }

                // Formatar para estrutura compatível com ESPN
                $gameDate = \Carbon\Carbon::parse($gameData['date']);

                // Extrair informação dos quartos (partials)
                $homePartials = $gameData['local']['partials'] ?? [];
                $awayPartials = $gameData['road']['partials'] ?? [];

                $linescores = [];
                for ($i = 1; $i <= 4; $i++) {
                    $quarter = "partials{$i}";
                    if (isset($homePartials[$quarter]) || isset($awayPartials[$quarter])) {
                        $linescores[] = [
                            'period' => $i,
                            'displayValue' => "Q{$i}",
                        ];
                    }
                }

                return [
                    'header' => [
                        'id' => $gameData['identifier'],
                        'season' => [
                            'year' => $gameData['season']['year'] ?? 2025,
                            'type' => 1,
                            'displayName' => $gameData['season']['name'] ?? 'EuroLeague 2025-26',
                        ],
                        'competitions' => [
                            [
                                'id' => $gameData['identifier'],
                                'date' => $gameDate->toIso8601String(),
                                'attendance' => $gameData['audience'] ?? null,
                                'neutralSite' => $gameData['isNeutralVenue'] ?? false,
                                'conferenceCompetition' => false,
                                'playByPlayAvailable' => false,
                                'recent' => false,
                                'status' => [
                                    'clock' => 0,
                                    'displayClock' => '0:00',
                                    'period' => $gameData['played'] ? 4 : 0,
                                    'type' => [
                                        'id' => $gameData['played'] ? '3' : '1',
                                        'name' => $gameData['played'] ? 'STATUS_FINAL' : 'STATUS_SCHEDULED',
                                        'state' => $gameData['played'] ? 'post' : 'pre',
                                        'completed' => $gameData['played'],
                                        'description' => $gameData['played'] ? 'Final' : 'Scheduled',
                                        'detail' => $gameData['gameStatus'] ?? 'Scheduled',
                                        'shortDetail' => $gameData['played'] ? 'Final' : $gameDate->format('M j, Y'),
                                    ],
                                ],
                                'competitors' => [
                                    [
                                        'id' => $gameData['local']['club']['code'],
                                        'uid' => "s:101~t:{$gameData['local']['club']['code']}",
                                        'type' => 'team',
                                        'order' => 0,
                                        'homeAway' => 'home',
                                        'winner' => ($gameData['local']['score'] ?? 0) > ($gameData['road']['score'] ?? 0),
                                        'team' => [
                                            'id' => $gameData['local']['club']['code'],
                                            'uid' => "s:101~t:{$gameData['local']['club']['code']}",
                                            'location' => explode(' ', $gameData['local']['club']['name'])[0] ?? '',
                                            'name' => $gameData['local']['club']['name'],
                                            'displayName' => $gameData['local']['club']['name'],
                                            'shortDisplayName' => $gameData['local']['club']['abbreviatedName'] ?? $gameData['local']['club']['name'],
                                            'abbreviation' => $gameData['local']['club']['code'],
                                            'logo' => $gameData['local']['club']['images']['crest'] ?? null,
                                            'color' => '003399',
                                            'alternateColor' => 'FF6C00',
                                        ],
                                        'score' => (string)($gameData['local']['score'] ?? 0),
                                        'linescores' => array_map(function($i) use ($homePartials) {
                                            $quarter = "partials{$i}";
                                            return ['value' => $homePartials[$quarter] ?? 0];
                                        }, [1, 2, 3, 4]),
                                        'statistics' => [],
                                        'records' => [],
                                    ],
                                    [
                                        'id' => $gameData['road']['club']['code'],
                                        'uid' => "s:101~t:{$gameData['road']['club']['code']}",
                                        'type' => 'team',
                                        'order' => 1,
                                        'homeAway' => 'away',
                                        'winner' => ($gameData['road']['score'] ?? 0) > ($gameData['local']['score'] ?? 0),
                                        'team' => [
                                            'id' => $gameData['road']['club']['code'],
                                            'uid' => "s:101~t:{$gameData['road']['club']['code']}",
                                            'location' => explode(' ', $gameData['road']['club']['name'])[0] ?? '',
                                            'name' => $gameData['road']['club']['name'],
                                            'displayName' => $gameData['road']['club']['name'],
                                            'shortDisplayName' => $gameData['road']['club']['abbreviatedName'] ?? $gameData['road']['club']['name'],
                                            'abbreviation' => $gameData['road']['club']['code'],
                                            'logo' => $gameData['road']['club']['images']['crest'] ?? null,
                                            'color' => '003399',
                                            'alternateColor' => 'FF6C00',
                                        ],
                                        'score' => (string)($gameData['road']['score'] ?? 0),
                                        'linescores' => array_map(function($i) use ($awayPartials) {
                                            $quarter = "partials{$i}";
                                            return ['value' => $awayPartials[$quarter] ?? 0];
                                        }, [1, 2, 3, 4]),
                                        'statistics' => [],
                                        'records' => [],
                                    ],
                                ],
                                'notes' => [],
                                'situation' => null,
                                'broadcasts' => [],
                                'leaders' => [],
                                'format' => [
                                    'regulation' => [
                                        'periods' => 4,
                                    ],
                                ],
                                'startDate' => $gameDate->toIso8601String(),
                                'geoBroadcasts' => [],
                                'headlines' => [],
                            ],
                        ],
                    ],
                    'boxscore' => null, // Euroleague API não fornece boxscore detalhado
                    'gameInfo' => [
                        'venue' => [
                            'id' => $gameData['venue']['code'] ?? null,
                            'fullName' => $gameData['venue']['name'] ?? null,
                            'address' => [
                                'city' => $gameData['venue']['address'] ?? null,
                            ],
                            'capacity' => (string)($gameData['venue']['capacity'] ?? 0),
                            'indoor' => true,
                        ],
                        'attendance' => $gameData['audienceConfirmed'] ? (string)($gameData['audience'] ?? 0) : null,
                        'officials' => array_filter([
                            isset($gameData['referee1']) ? [
                                'displayName' => $gameData['referee1']['name'] ?? '',
                                'position' => ['abbreviation' => 'Referee'],
                            ] : null,
                            isset($gameData['referee2']) ? [
                                'displayName' => $gameData['referee2']['name'] ?? '',
                                'position' => ['abbreviation' => 'Referee'],
                            ] : null,
                            isset($gameData['referee3']) ? [
                                'displayName' => $gameData['referee3']['name'] ?? '',
                                'position' => ['abbreviation' => 'Referee'],
                            ] : null,
                        ]),
                    ],
                ];

            } catch (\Exception $e) {
                Log::error('Euroleague game details API error: ' . $e->getMessage());
                return null;
            }
        });
    }

    public function getScoreboard(?string $date = null)
    {
        return $this->getGames();
    }

    public function getNews(int $limit = 10)
    {
        $cacheKey = "euroleague_news_{$limit}";

        return Cache::remember($cacheKey, 1800, function () use ($limit) {
            try {
                $recentGamesData = $this->getFinishedGames(7);
                $upcomingGamesData = $this->getGames(7);

                $recentGames = $recentGamesData['response'] ?? [];
                $upcomingGames = $upcomingGamesData['response'] ?? [];

                $allNews = [];

                // Criar notícias dos jogos finalizados
                foreach (array_slice($recentGames, 0, $limit / 2) as $game) {
                    if (!isset($game['teams'])) continue;

                    $home = $game['teams']['home'];
                    $away = $game['teams']['away'];
                    $homeScore = $home['score'] ?? 0;
                    $awayScore = $away['score'] ?? 0;
                    $homeName = $home['name'] ?? 'Unknown';
                    $awayName = $away['name'] ?? 'Unknown';
                    $winner = $homeScore > $awayScore ? $homeName : $awayName;
                    $loser = $winner === $homeName ? $awayName : $homeName;

                    $competitionName = $game['league']['name'] ?? 'EuroLeague';

                    $allNews[] = [
                        'id' => 'game_' . ($game['id'] ?? uniqid()),
                        'headline' => "{$winner} defeats {$loser}",
                        'description' => "{$homeName} {$homeScore} - {$awayScore} {$awayName} in {$competitionName}",
                        'published' => $game['date'] ?? now()->toIso8601String(),
                        'link' => "https://www.euroleaguebasketball.net/euroleague/game-center/",
                        'image' => $home['logo'] ?? null,
                        'league' => $competitionName,
                        'type' => 'game-recap',
                        'images' => isset($home['logo']) ? [
                            ['url' => $home['logo'], 'alt' => $homeName]
                        ] : [],
                        'links' => [
                            'web' => ['href' => "https://www.euroleaguebasketball.net/euroleague/game-center/"]
                        ],
                    ];
                }

                // Criar notícias dos jogos futuros
                foreach (array_slice($upcomingGames, 0, $limit / 2) as $game) {
                    if (!isset($game['teams'])) continue;

                    $home = $game['teams']['home'];
                    $away = $game['teams']['away'];
                    $homeName = $home['name'] ?? 'Unknown';
                    $awayName = $away['name'] ?? 'Unknown';

                    $compName = $game['league']['name'] ?? 'EuroLeague';

                    $allNews[] = [
                        'id' => 'preview_' . ($game['id'] ?? uniqid()),
                        'headline' => "Upcoming: {$homeName} vs {$awayName}",
                        'description' => "Match preview for {$compName} game",
                        'published' => now()->subHours(rand(1, 24))->toIso8601String(),
                        'link' => "https://www.euroleaguebasketball.net/euroleague/game-center/",
                        'image' => $home['logo'] ?? null,
                        'league' => $compName,
                        'type' => 'game-preview',
                        'images' => isset($home['logo']) ? [
                            ['url' => $home['logo'], 'alt' => $homeName]
                        ] : [],
                        'links' => [
                            'web' => ['href' => "https://www.euroleaguebasketball.net/euroleague/game-center/"]
                        ],
                    ];
                }

                // Ordenar por data
                usort($allNews, function($a, $b) {
                    return strtotime($b['published']) - strtotime($a['published']);
                });

                return array_slice($allNews, 0, $limit);

            } catch (\Exception $e) {
                Log::error('Euroleague news generation error: ' . $e->getMessage());
                return [];
            }
        });
    }

    public function getStandings(?string $competition = 'E')
    {
        $cacheKey = "euroleague_standings_{$competition}";

        return Cache::remember($cacheKey, 1800, function () use ($competition) {
            try {
                $finishedGamesData = $this->getFinishedGames(365); // Get full season
                $games = $finishedGamesData['response'] ?? [];

                if (empty($games)) {
                    Log::warning("No Euroleague finished games found to calculate standings");
                    return [];
                }

                $teamsMap = [];

                // Process each finished game
                foreach ($games as $game) {
                    $homeId = $game['teams']['home']['id'] ?? null;
                    $awayId = $game['teams']['away']['id'] ?? null;
                    $homeScore = $game['teams']['home']['score'] ?? 0;
                    $awayScore = $game['teams']['away']['score'] ?? 0;

                    if (!$homeId || !$awayId) continue;

                    // Initialize home team
                    if (!isset($teamsMap[$homeId])) {
                        $teamsMap[$homeId] = [
                            'team' => [
                                'id' => $homeId,
                                'name' => $game['teams']['home']['name'] ?? '',
                                'abbreviation' => $homeId,
                                'logo' => $game['teams']['home']['logo'] ?? null,
                            ],
                            'wins' => 0,
                            'losses' => 0,
                        ];
                    }

                    // Initialize away team
                    if (!isset($teamsMap[$awayId])) {
                        $teamsMap[$awayId] = [
                            'team' => [
                                'id' => $awayId,
                                'name' => $game['teams']['away']['name'] ?? '',
                                'abbreviation' => $awayId,
                                'logo' => $game['teams']['away']['logo'] ?? null,
                            ],
                            'wins' => 0,
                            'losses' => 0,
                        ];
                    }

                    // Update win/loss records
                    if ($homeScore > $awayScore) {
                        $teamsMap[$homeId]['wins']++;
                        $teamsMap[$awayId]['losses']++;
                    } else if ($awayScore > $homeScore) {
                        $teamsMap[$awayId]['wins']++;
                        $teamsMap[$homeId]['losses']++;
                    }
                }

                if (empty($teamsMap)) {
                    return [];
                }

                // Calcular percentagem vitorias
                foreach ($teamsMap as &$team) {
                    $totalGames = $team['wins'] + $team['losses'];
                    $team['winPercentage'] = $totalGames > 0 ? round($team['wins'] / $totalGames, 3) : 0;
                }

                $standings = array_values($teamsMap);
                usort($standings, function($a, $b) {
                    if ($a['wins'] != $b['wins']) {
                        return $b['wins'] <=> $a['wins'];
                    }
                    return $a['losses'] <=> $b['losses'];
                });

                // Calcular streaks (últimos jogos)
                $teamGames = [];
                foreach ($games as $game) {
                    foreach (['home', 'away'] as $side) {
                        $teamId = $game['teams'][$side]['id'] ?? null;
                        if (!$teamId) continue;
                        if (!isset($teamGames[$teamId])) $teamGames[$teamId] = [];
                        $isWin = false;
                        $score = $game['teams'][$side]['score'] ?? 0;
                        $oppScore = $game['teams'][$side === 'home' ? 'away' : 'home']['score'] ?? 0;
                        if ($score > $oppScore) $isWin = true;
                        $teamGames[$teamId][] = $isWin ? 'W' : 'L';
                    }
                }

                // Calcular gamesBehind
                $maxWins = $standings[0]['wins'] ?? 0;
                $maxLosses = $standings[0]['losses'] ?? 0;

                foreach ($standings as $idx => &$team) {
                    $team['position'] = $idx + 1;
                    // Games Behind
                    $team['gamesBehind'] = ($team['wins'] === $maxWins && $team['losses'] === $maxLosses)
                        ? '0.0'
                        : number_format((($maxWins - $team['wins']) + ($team['losses'] - $maxLosses)) / 2, 1);

                    $streak = '-';
                    if (!empty($teamGames[$team['team']['id']])) {
                        $results = array_reverse($teamGames[$team['team']['id']]);
                        $last = $results[0] ?? null;
                        $count = 0;
                        foreach ($results as $r) {
                            if ($r === $last) $count++;
                            else break;
                        }
                        if ($last && $count > 0) $streak = $last . $count;
                    }
                    $team['streak'] = $streak;
                    $team['conference'] = $this->competitions[$competition] ?? 'Euroleague';
                }

                return $standings;

            } catch (\Exception $e) {
                Log::error('Euroleague standings error: ' . $e->getMessage());
                return [];
            }
        });
    }

    /**
     * Format streak information
     */
    private function formatStreak($entry)
    {
        // Try to determine streak from recent results if available
        if (isset($entry['streak'])) {
            return $entry['streak'];
        }

        // If we have consecutive wins/losses info
        if (isset($entry['consecutiveWins']) && $entry['consecutiveWins'] > 0) {
            return 'W' . $entry['consecutiveWins'];
        }

        if (isset($entry['consecutiveLosses']) && $entry['consecutiveLosses'] > 0) {
            return 'L' . $entry['consecutiveLosses'];
        }

        return '-';
    }


    public function searchPlayers(string $query): array
    {
        $query = strtolower(trim($query));
        $results = [];

        try {
            // Busca jogadores da season atual
            $response = Http::timeout(15)
                ->get("{$this->apiBaseUrl}/competitions/E/seasons/{$this->currentSeason}/people");

            if (!$response->successful()) {
                return [];
            }

            $people = $response->json('data', []);

            foreach ($people as $person) {
                if (!isset($person['person'])) continue;

                $player = $person['person'];
                $fullName = strtolower(($player['name'] ?? '') . ' ' . ($player['surname'] ?? ''));

                if (empty($query) || str_contains($fullName, $query)) {
                    // Busca equipa do jogador
                    $teamName = 'Unknown';
                    if (isset($person['club']['name'])) {
                        $teamName = $person['club']['name'];
                    } elseif (isset($person['club']['code'])) {
                        $teamName = $person['club']['code'];
                    }

                    $results[] = [
                        'code' => $player['code'] ?? '',
                        'name' => trim(($player['name'] ?? '') . ' ' . ($player['surname'] ?? '')),
                        'team' => $teamName,
                        'position' => $person['positionName'] ?? null,
                        'dorsal' => $person['dorsal'] ?? null,
                        'imageUrl' => isset($player['imageUrl'])
                            ? 'https://img.euroleaguebasketball.net/player_images/' . basename($player['imageUrl'])
                            : null,
                    ];
                }
            }
        } catch (\Exception $e) {
            Log::error('Euroleague search error: ' . $e->getMessage());
        }

        return $results;
    }
}
