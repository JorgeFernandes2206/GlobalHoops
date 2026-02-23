@extends('emails.layout')

@section('content')
    <h1>{{ $title }}</h1>

    <p>{{ $greeting ?? 'Olá!' }}</p>

    @if(isset($introLines))
        @foreach($introLines as $line)
            <p>{{ $line }}</p>
        @endforeach
    @endif

    @if(isset($actionText) && isset($actionUrl))
        <div style="text-align: center;">
            <a href="{{ $actionUrl }}" class="button">{{ $actionText }}</a>
        </div>
    @endif

    @if(isset($outroLines))
        <div class="divider"></div>
        @foreach($outroLines as $line)
            <p style="font-size: 13px; color: #9ca3af;">{{ $line }}</p>
        @endforeach
    @endif

    @if(isset($actionUrl))
        <div class="divider"></div>
        <p style="font-size: 13px; color: #9ca3af;">
            <strong>Link alternativo:</strong><br>
            Se o botão não funcionar, copia e cola este link:<br>
            <span style="color: #f97316; word-break: break-all;">{{ $actionUrl }}</span>
        </p>
    @endif
@endsection
