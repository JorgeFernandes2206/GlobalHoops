<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class SendTestNotification extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'push:test {user_id?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send a test push notification to a user';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $userId = $this->argument('user_id');

        if (!$userId) {
            $userId = $this->ask('Enter user ID');
        }

        $user = \App\Models\User::find($userId);

        if (!$user) {
            $this->error("User #{$userId} not found");
            return 1;
        }

        $subscriptions = $user->pushSubscriptions()->count();

        if ($subscriptions === 0) {
            $this->warn("User #{$userId} ({$user->name}) has no push subscriptions");
            return 1;
        }

        $this->info("Sending test notification to {$user->name} ({$subscriptions} device(s))...");

        $pushService = app(\App\Services\PushNotificationService::class);

        $result = $pushService->sendToUser(
            $user,
            '🏀 GlobalHoops Test',
            'Esta é uma notificação de teste! O sistema está a funcionar.',
            asset('favicon.ico'),
            route('inicio')
        );

        if ($result) {
            $this->info('✓ Notification sent successfully!');
            return 0;
        } else {
            $this->error('✗ Failed to send notification. Check logs for details.');
            return 1;
        }
    }
}
