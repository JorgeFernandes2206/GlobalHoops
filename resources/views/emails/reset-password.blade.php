@extends('emails.layout')

@section('content')
    <h1>Reset Your Password</h1>

    <p>Hello,</p>

    <p>We received a request to reset the password for your GlobalHoops account.</p>

    <div class="highlight">
        <p style="margin: 0; color: #f9fafb;">Click the button below to create a new password:</p>
    </div>

    <div style="text-align: center;">
        <a href="{{ $resetUrl }}" class="button">Reset Password</a>
    </div>

    <div class="stats-box">
        <p style="margin: 0; font-size: 13px; color: #d1d5db;">
            This link expires in <strong>60 minutes</strong>.<br>
            If you didn't request a password reset, please ignore this email.
        </p>
    </div>

    <div class="divider"></div>

    <p style="font-size: 13px; color: #9ca3af;">
        <strong>Alternative link:</strong><br>
        If the button doesn't work, copy and paste this link into your browser:<br>
        <span style="color: #f97316; word-break: break-all;">{{ $resetUrl }}</span>
    </p>

    <p style="font-size: 13px; color: #9ca3af;">
        If you didn't request a password reset, your account remains secure and you can safely ignore this email.
    </p>
@endsection
