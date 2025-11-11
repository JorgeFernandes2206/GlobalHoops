<?php
$j = json_decode(file_get_contents(__DIR__ . '/../storage/logs/game_summary_nba_401809502.json'), true);
$summary = $j;
if ($summary !== null && isset($summary['raw']) && is_array($summary['raw'])) {
    $summary = $summary['raw'];
}
$teamId = '11';
$injuries = [];
if (isset($summary['boxscore']['players']) && is_array($summary['boxscore']['players'])) {
    // skip
}

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

print_r($injuries);
