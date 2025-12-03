<?php

require 'vendor/autoload.php';

$keys = \Minishlink\WebPush\VAPID::createVapidKeys();

echo "Add these to your .env file:\n\n";
echo "VAPID_PUBLIC_KEY={$keys['publicKey']}\n";
echo "VAPID_PRIVATE_KEY={$keys['privateKey']}\n";
