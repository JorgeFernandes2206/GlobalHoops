@extends('emails.layout')

@section('content')
    <h1>Verifica o teu Email 📧</h1>

    <p>Olá {{ $userName }},</p>

    <p>Para começares a usar todas as funcionalidades do GlobalHoops, precisamos que verifiques o teu endereço de email.</p>

    <div class="highlight">
        <p style="margin: 0; color: #f9fafb;">Clica no botão abaixo para verificar a tua conta:</p>
    </div>

    <div style="text-align: center;">
        <a href="{{ $verificationUrl }}" class="button">Verificar Email</a>
    </div>

    <div class="divider"></div>

    <p style="font-size: 13px; color: #9ca3af;">
        Se não criaste uma conta no GlobalHoops, podes ignorar este email com segurança.
    </p>

    <p style="font-size: 13px; color: #9ca3af;">
        <strong>Link alternativo:</strong><br>
        Se o botão não funcionar, copia e cola este link no teu navegador:<br>
        <span style="color: #f97316; word-break: break-all;">{{ $verificationUrl }}</span>
    </p>
@endsection
