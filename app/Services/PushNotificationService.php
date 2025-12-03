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

    /**
     * Send push notification to a subscription
     */
    public function sendNotification($subscriptionData, string $title, string $body, ?string $icon = null, ?string $url = null)
    {
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

            $report = $this->webPush->sendOneNotification($subscription, $payload);

            if ($report->isSuccess()) {
                Log::info('Push notification sent successfully');
                return true;
            } else {
                Log::warning('Push notification failed', [
                    'reason' => $report->getReason(),
                    'expired' => $report->isSubscriptionExpired(),
                ]);

                // Se expirada, remover da BD
                if ($report->isSubscriptionExpired()) {
                    PushSubscription::where('subscription', json_encode($subscriptionData))->delete();
                }

                return false;
            }
        } catch (\Exception $e) {
            Log::error('Push notification error', [
                'message' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Send notification to all user's devices
     */
    public function sendToUser($user, string $title, string $body, ?string $icon = null, ?string $url = null)
    {
        $subscriptions = $user->pushSubscriptions()->get();

        if ($subscriptions->isEmpty()) {
            Log::info('No push subscriptions found for user', ['user_id' => $user->id]);
            return;
        }

        foreach ($subscriptions as $subscription) {
            $this->sendNotification(
                $subscription->subscription,
                $title,
                $body,
                $icon,
                $url
            );
        }
    }

    /**
     * Send notification to users following specific teams
     */
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
