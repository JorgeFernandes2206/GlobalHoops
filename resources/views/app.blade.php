<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="dark">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link rel="dns-prefetch" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Preload Critical Assets -->
        @php
            $manifest = json_decode(file_get_contents(public_path('build/manifest.json')), true);
            $appCss = $manifest['resources/js/app.jsx']['css'][0] ?? null;
            $vendorJs = $manifest['_vendor-D616Ne27.js']['file'] ?? null;
            $inertiaJs = $manifest['_inertia-C2RNzYob.js']['file'] ?? null;
        @endphp
        @if($appCss)
            <link rel="preload" href="/build/{{ $appCss }}" as="style">
        @endif
        @if($vendorJs)
            <link rel="preload" href="/build/{{ $vendorJs }}" as="script" crossorigin>
        @endif
        @if($inertiaJs)
            <link rel="preload" href="/build/{{ $inertiaJs }}" as="script" crossorigin>
        @endif

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased bg-gray-900 text-white">
        @inertia
    </body>
</html>
