<?php
$j = json_decode(file_get_contents(__DIR__ . '/../storage/logs/game_summary_nba_401809502.json'), true);
$raw = $j['raw'] ?? $j;
if (!isset($raw['injuries'])) { echo "no injuries top-level\n"; exit(0); }
foreach ($raw['injuries'] as $ti => $teamInj) {
    $team = $teamInj['team'] ?? null;
    $teamId = is_array($team) ? ($team['id'] ?? null) : $team;
    echo "TeamIdx=$ti teamId={$teamId}\n";
    $inner = $teamInj['injuries'] ?? ($teamInj['players'] ?? []);
    echo " inner count=" . count($inner) . "\n";
    foreach ($inner as $entry) {
        $ath = $entry['athlete'] ?? null;
        $aid = $ath['id'] ?? null;
        $name = $ath['displayName'] ?? ($ath['fullName'] ?? null);
        echo "  athlete id={$aid} name={$name} type=" . ($entry['type']['name'] ?? '') . " status=" . ($entry['status'] ?? '') . "\n";
    }
}
