@extends('emails.layout')

@section('content')
    <h1>Welcome to GlobalHoops!</h1>

    <p>Hey {{ $userName }},</p>

    <p>Thanks for joining <strong>GlobalHoops</strong> - your new home for everything basketball!</p>

    <div class="highlight">
        <p style="margin: 0; color: #f9fafb;"><strong>Your account has been created successfully!</strong></p>
    </div>

    <p>Now you can:</p>

    <div class="stats-box">
        <p style="margin-bottom: 10px;">Follow your favorite teams</p>
        <p style="margin-bottom: 10px;">Watch live games and statistics</p>
        <p style="margin-bottom: 10px;">Receive notifications for important games</p>
        <p style="margin: 0;">Comment and interact with the community</p>
    </div>

    <div class="divider"></div>

    <p style="font-size: 13px; color: #9ca3af;">
        If you didn't create this account, you can safely ignore this email.
    </p>
@endsection
