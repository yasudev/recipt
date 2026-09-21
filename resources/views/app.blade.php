<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="theme-color" content="#0f172a">
    <meta name="description" content="Modern responsive Point of Sale, inventory management with MySQL database sync for products, sales transactions, and print settings.">
    <title>Yum POS</title>
    <meta property="og:title" content="Yum POS" />
    <meta property="og:description" content="Modern responsive Point of Sale, inventory management with MySQL database sync for products, sales transactions, and print settings." />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="manifest" href="/manifest.webmanifest">
    <link rel="icon" href="/icon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="Yum POS">
    @vite(['resources/js/main.ts', 'resources/js/index.css'])
</head>
<body class="bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
    <div id="app"></div>
</body>
</html>