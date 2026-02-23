<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

// Set OpenSSL configuration path for Windows (required for VAPID key generation)
if (PHP_OS_FAMILY === 'Windows' && !getenv('OPENSSL_CONF')) {
    $opensslPath = env('OPENSSL_CONF', 'C:\\PHP\\openssl.cnf');
    if (file_exists($opensslPath)) {
        putenv("OPENSSL_CONF=$opensslPath");
    }
}

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
