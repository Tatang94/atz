<?php
session_start();
require_once 'config/app.php';
require_once 'includes/functions.php';

// Router sederhana
$request = $_SERVER['REQUEST_URI'];
$path = parse_url($request, PHP_URL_PATH);

switch ($path) {
    case '/':
        include 'views/splash.php';
        break;
    case '/home':
        include 'views/home.php';
        break;
    case '/admin':
        include 'views/admin/dashboard.php';
        break;
    case '/api/products':
        include 'api/products.php';
        break;
    case '/api/transaction':
        include 'api/transaction.php';
        break;
    case '/api/admin/stats':
        include 'api/admin/stats.php';
        break;
    default:
        http_response_code(404);
        include 'views/404.php';
        break;
}
?>