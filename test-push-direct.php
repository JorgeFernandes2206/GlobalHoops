<?php

require 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Teste Direto de Push Notification ===\n\n";

// 1. Verificar VAPID keys
$publicKey = env('VAPID_PUBLIC_KEY', 'BLo8BJuxJfXxXJt9oSmCzPvKXfG1-LSSyGBvJZ14KGlp-8JY0eGMN7UEt6CWjKvUmSiMgJJP6d4hEz2gJLLjqNs');
$privateKey = env('VAPID_PRIVATE_KEY', '5Jxz6D0k8lBfOr9qUO-h0dPvQxY6cCWe0gLkPqJPGNY');

echo "Public Key: " . substr($publicKey, 0, 20) . "...\n";
echo "Private Key: " . substr($privateKey, 0, 20) . "...\n\n";

// 2. Buscar subscrição do user 2
$user = App\Models\User::find(2);
if (!$user) {
    die("User not found\n");
}

$subscription = $user->pushSubscriptions()->first();
if (!$subscription) {
    die("No subscription found for user\n");
}

echo "User: {$user->name}\n";
echo "Subscription endpoint: " . substr($subscription->endpoint, 0, 50) . "...\n\n";

// 3. Tentar enviar com mais detalhes de erro
try {
    $auth = [
        'VAPID' => [
            'subject' => 'mailto:test@example.com',
            'publicKey' => $publicKey,
            'privateKey' => $privateKey,
        ],
    ];

    echo "Creating WebPush instance...\n";
    $webPush = new \Minishlink\WebPush\WebPush($auth);

    echo "Creating subscription object...\n";
    $subscriptionData = json_decode($subscription->subscription, true);
    $sub = \Minishlink\WebPush\Subscription::create($subscriptionData);

    echo "Preparing payload...\n";
    $payload = json_encode([
        'title' => 'Teste GlobalHoops',
        'body' => 'Notificação de teste!',
        'icon' => '/favicon.ico',
    ]);

    echo "Sending notification...\n";
    $report = $webPush->sendOneNotification($sub, $payload);

    if ($report->isSuccess()) {
        echo "\n✓✓✓ SUCCESS! Notificação enviada!\n";
    } else {
        echo "\n✗ Failed:\n";
        echo "Reason: " . $report->getReason() . "\n";
        echo "Expired: " . ($report->isSubscriptionExpired() ? 'Yes' : 'No') . "\n";
        if ($report->getResponse()) {
            echo "Response code: " . $report->getResponse()->getStatusCode() . "\n";
            echo "Response body: " . $report->getResponse()->getBody() . "\n";
        }
    }

} catch (\Exception $e) {
    echo "\n✗✗✗ EXCEPTION:\n";
    echo "Message: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "\nStack trace:\n" . $e->getTraceAsString() . "\n";
}
