<?php

namespace App\Services;

use App\Models\PushSubscription;
use Illuminate\Support\Facades\Log;
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

class PushNotificationService
{
    protected $webPush;

    public function __construct()
    {
        $auth = [
            'VAPID' => [
                'subject' => config('app.url'),
                'publicKey' => config('services.vapid.public_key'),
                'privateKey' => config('services.vapid.private_key'),
            ],
        ];

        $this->webPush = new WebPush($auth);
    }


    //Envia notificacão
    public function sendNotification($subscriptionData, string $title, string $body, ?string $icon = null, ?string $url = null)
    {
        Log::info('[sendNotification] Início', [
            'subscriptionData' => $subscriptionData,
            'title' => $title,
            'body' => $body,
            'icon' => $icon,
            'url' => $url,
        ]);
        try {
            $payload = json_encode([
                'title' => $title,
                'body' => $body,
                'icon' => $icon ?? asset('favicon.ico'),
                'badge' => asset('favicon.ico'),
                'url' => $url ?? route('inicio'),
                'timestamp' => now()->timestamp,
            ]);

            $subscription = is_array($subscriptionData)
                ? Subscription::create($subscriptionData)
                : Subscription::create(json_decode($subscriptionData, true));

            Log::info('[sendNotification] Subscription object criado', [
                'endpoint' => $subscription->getEndpoint(),
            ]);

            $report = $this->webPush->sendOneNotification($subscription, $payload);

            if ($report->isSuccess()) {
                Log::info('[sendNotification] Push notification sent successfully', [
                    'endpoint' => $subscription->getEndpoint(),
                ]);
                return true;
            } else {
                Log::warning('[sendNotification] Push notification failed', [
                    'reason' => $report->getReason(),
                    'expired' => $report->isSubscriptionExpired(),
                    'endpoint' => $subscription->getEndpoint(),
                ]);

                // Se expirada, remover da BD
                if ($report->isSubscriptionExpired()) {
                    PushSubscription::where('subscription', json_encode($subscriptionData))->delete();
                }

                return false;
            }
        } catch (\Exception $e) {
            Log::error('[sendNotification] Push notification error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return false;
        }
    }

    public function sendToUser($user, string $title, string $body, ?string $icon = null, ?string $url = null)
    {
        Log::info('[sendToUser] Início', [
            'user_id' => $user->id,
            'user_email' => $user->email,
        ]);
        $subscriptions = $user->pushSubscriptions()->get();

        if ($subscriptions->isEmpty()) {
            Log::info('[sendToUser] No push subscriptions found for user', ['user_id' => $user->id]);
            return false;
        }

        $success = false;
        foreach ($subscriptions as $subscription) {
            Log::info('[sendToUser] Tentando enviar para subscription', [
                'subscription_id' => $subscription->id,
                'endpoint' => $subscription->endpoint,
            ]);
            $result = $this->sendNotification(
                $subscription->subscription,
                $title,
                $body,
                $icon,
                $url
            );
            if ($result) {
                $success = true;
            }
        }

        Log::info('[sendToUser] Fim', [
            'user_id' => $user->id,
            'success' => $success,
        ]);
        return $success;
    }

    public function sendToTeamFollowers(array $teamApiIds, string $title, string $body, ?string $icon = null, ?string $url = null)
    {
        $users = \App\Models\User::whereHas('teamFollowers', function ($query) use ($teamApiIds) {
            $query->whereIn('team_api_id', $teamApiIds)
                  ->where('notifications_enabled', true);
        })->get();

        foreach ($users as $user) {
            $this->sendToUser($user, $title, $body, $icon, $url);
        }
    }
}
