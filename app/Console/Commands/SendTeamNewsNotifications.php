<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\BasketballApiService;
use App\Services\PushNotificationService;
use App\Models\TeamFollower;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SendTeamNewsNotifications extends Command
{
    protected $signature = 'push:team-news';
    protected $description = 'Envia push notification quando sai notícia nova sobre equipa seguida';

    public function handle(BasketballApiService $basketballApi, PushNotificationService $pushService)
    {
        $lastSentKey = 'last_sent_news_ids';
        $lastSent = Cache::get($lastSentKey, []);
        $followers = TeamFollower::where('notifications_enabled', true)->get();
        $notified = 0;
        $newsSent = [];

        foreach ($followers->groupBy('team_api_id') as $teamId => $teamFollowers) {
            $news = $basketballApi->getTeamsNews([$teamId], null, 3); // últimas 3 notícias
            foreach ($news as $article) {
                if (isset($lastSent[$teamId]) && in_array($article['id'], $lastSent[$teamId])) {
                    continue; // já foi enviada
                }
                $userIds = $teamFollowers->pluck('user_id')->unique();
                $pushService->sendToTeamFollowers([$teamId], $article['title'], $article['summary'] ?? '', $article['image'] ?? null, $article['url'] ?? null);
                $newsSent[$teamId][] = $article['id'];
                $notified++;
                Log::info("Push enviado: {$article['title']} para seguidores da equipa {$teamId}");
            }
        }
        // Atualiza cache para não repetir notificações
        $merged = array_merge_recursive($lastSent, $newsSent);
        foreach ($merged as $teamId => $ids) {
            $merged[$teamId] = array_slice(array_unique($ids), -10); // guarda só os últimos 10
        }
        Cache::put($lastSentKey, $merged, 86400);
        $this->info("Notificações enviadas: {$notified}");
    }
}
