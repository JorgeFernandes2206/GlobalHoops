<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\PushNotificationService;
use App\Models\User;

class SendDemoNotification extends Command
{
    protected $signature = 'push:demo {user_id?}';
    protected $description = 'Envia uma notificação push de teste para demonstração';

    public function handle(PushNotificationService $pushService)
    {
        $userId = $this->argument('user_id') ?? 1;
        $user = User::find($userId);
        if (!$user) {
            $this->error('Utilizador não encontrado.');
            return 1;
        }
        $title = '🏀 GlobalHoops Test';
        $body = 'This is a test notification! The system is working.';
        $icon = asset('favicon.ico');
        $url = route('inicio');
        $result = $pushService->sendToUser($user, $title, $body, $icon, $url);
        if ($result) {
            $this->info('Notification sent successfully!');
        } else {
            $this->error('Failed to send notification. Check logs for details.');
        }
        return 0;
    }
}
