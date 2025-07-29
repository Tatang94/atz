<?php
// Konfigurasi Database
define('DB_HOST', 'localhost');
define('DB_NAME', 'pulsa_indonesia');
define('DB_USER', 'root');
define('DB_PASS', '');

// Konfigurasi API
define('DIGIFLAZZ_USERNAME', '');
define('DIGIFLAZZ_API_KEY', '');
define('PAYDISINI_API_KEY', '');

// Konfigurasi Aplikasi
define('APP_NAME', 'Pulsa Indonesia');
define('APP_URL', 'http://localhost');
define('APP_DEBUG', true);

// Koneksi Database
try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME, DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    if (APP_DEBUG) {
        die("Database connection failed: " . $e->getMessage());
    } else {
        die("Database connection failed");
    }
}
?>