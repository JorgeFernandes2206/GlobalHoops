<?php
require __DIR__ . '/../vendor/autoload.php';

use App\Services\BasketballApiService;

$service = new BasketballApiService();
$json = json_decode(file_get_contents(__DIR__ . '/../storage/logs/game_summary_nba_401809502.json'), true);
$result = $service->getTeamInjuries('nba', '11', $json);
echo "Result for home (11):\n";
print_r($result);

$result2 = $service->getTeamInjuries('nba', '1', $json);
echo "Result for away (1):\n";
print_r($result2);
