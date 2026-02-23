<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title ?? 'GlobalHoops' }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #000000;
            color: #ffffff;
            padding: 20px;
            line-height: 1.6;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .header {
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
            padding: 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
            animation: pulse 3s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 0.8; }
        }

        .logo {
            font-size: 32px;
            font-weight: 900;
            color: white;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            position: relative;
            z-index: 1;
        }

        .logo span {
            background: linear-gradient(to bottom, #ffffff, #f3f4f6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .content {
            padding: 40px 30px;
        }

        h1 {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 20px;
            color: #ffffff;
        }

        p {
            color: #d1d5db;
            margin-bottom: 16px;
            font-size: 15px;
        }

        .button {
            display: inline-block;
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
            color: white;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            box-shadow: 0 4px 15px rgba(249, 115, 22, 0.3);
            transition: all 0.3s ease;
        }

        .button:hover {
            box-shadow: 0 6px 20px rgba(249, 115, 22, 0.5);
            transform: translateY(-2px);
        }

        .footer {
            background: rgba(17, 24, 39, 0.5);
            padding: 25px 30px;
            text-align: center;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .footer p {
            color: #9ca3af;
            font-size: 13px;
            margin-bottom: 8px;
        }

        .social-links {
            margin-top: 15px;
        }

        .social-links a {
            display: inline-block;
            color: #d1d5db;
            text-decoration: none;
            margin: 0 10px;
            font-size: 13px;
            opacity: 0.8;
            transition: opacity 0.3s;
        }

        .social-links a:hover {
            opacity: 1;
            color: #f97316;
        }

        .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent);
            margin: 30px 0;
        }

        .highlight {
            background: rgba(249, 115, 22, 0.1);
            border-left: 3px solid #f97316;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
        }

        .stats-box {
            background: rgba(31, 41, 55, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }

        @media only screen and (max-width: 600px) {
            .container {
                border-radius: 0;
            }

            .header, .content, .footer {
                padding: 20px;
            }

            .logo {
                font-size: 28px;
            }

            h1 {
                font-size: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <span>🏀 GlobalHoops</span>
            </div>
        </div>

        <div class="content">
            @yield('content')
        </div>

        <div class="footer">
            <p>&copy; {{ date('Y') }} GlobalHoops. All rights reserved.</p>
            <p>Your #1 source for live basketball</p>
            <div class="social-links">
                <a href="{{ config('app.url') }}">Visit Website</a>
            </div>
        </div>
    </div>
</body>
</html>
