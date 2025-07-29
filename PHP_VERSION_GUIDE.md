# Panduan Versi PHP - Aplikasi Pulsa Indonesia

## Gambaran Umum
Aplikasi pulsa Indonesia versi PHP menggunakan arsitektur yang sama dengan versi Node.js, namun dibangun dengan PHP 8.1+, MySQL/PostgreSQL, dan framework modern seperti Laravel atau CodeIgniter 4.

## Struktur Database SQL

### Tabel Users (Pengguna)
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('user', 'reseller', 'admin') DEFAULT 'user',
    balance DECIMAL(15,2) DEFAULT 0.00,
    status ENUM('active', 'suspended', 'pending') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Tabel Products (Produk)
```sql
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    provider_id VARCHAR(100) NOT NULL,
    category ENUM('pulsa', 'data', 'pln', 'game', 'ewallet') NOT NULL,
    operator VARCHAR(50) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    description TEXT,
    price_user DECIMAL(10,2) NOT NULL,
    price_reseller DECIMAL(10,2) NOT NULL,
    price_admin DECIMAL(10,2) NOT NULL,
    status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_operator (operator),
    INDEX idx_status (status)
);
```

### Tabel Transactions (Transaksi)
```sql
CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    user_id INT,
    product_id INT NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'processing', 'success', 'failed', 'cancelled') DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    digiflazz_reference VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);
```

### Tabel Settings (Pengaturan)
```sql
CREATE TABLE settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description VARCHAR(255),
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Data default untuk pengaturan
INSERT INTO settings (setting_key, setting_value, description, is_public) VALUES
('site_name', 'Pulsa Indonesia', 'Nama website', true),
('digiflazz_username', '', 'Username Digiflazz API', false),
('digiflazz_api_key', '', 'API Key Digiflazz', false),
('payDisini_api_key', '', 'API Key PayDisini', false),
('markup_user', '1000', 'Markup harga untuk user biasa', false),
('markup_reseller', '500', 'Markup harga untuk reseller', false);
```

### Tabel Sessions (Sesi Login)
```sql
CREATE TABLE sessions (
    id VARCHAR(128) PRIMARY KEY,
    user_id INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    payload TEXT NOT NULL,
    last_activity INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_last_activity (last_activity)
);
```

## Arsitektur Aplikasi PHP

### 1. Struktur Folder
```
/
├── app/
│   ├── Controllers/
│   │   ├── AdminController.php
│   │   ├── ProductController.php
│   │   ├── TransactionController.php
│   │   └── ApiController.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── Product.php
│   │   ├── Transaction.php
│   │   └── Setting.php
│   ├── Services/
│   │   ├── DigiflazzService.php
│   │   ├── PayDisiniService.php
│   │   └── TransactionService.php
│   └── Helpers/
│       ├── ResponseHelper.php
│       └── ValidationHelper.php
├── public/
│   ├── assets/css/
│   ├── assets/js/
│   └── index.php
├── views/
│   ├── admin/
│   ├── layouts/
│   └── pages/
└── config/
    ├── database.php
    └── app.php
```

### 2. Teknologi yang Digunakan
- **Backend**: PHP 8.1+ dengan framework Laravel/CodeIgniter 4
- **Database**: MySQL 8.0 atau PostgreSQL 13+
- **Frontend**: HTML5, CSS3 (Tailwind CSS), JavaScript (Alpine.js/Vue.js)
- **Session**: Database session atau Redis
- **API**: RESTful API dengan JSON response

### 3. Fitur Utama
- **Dashboard Admin**: Statistik real-time, manajemen produk, konfigurasi API
- **Sistem Transaksi**: Pembelian pulsa, data, PLN, game voucher, top-up e-wallet
- **Integrasi API**: Digiflazz untuk produk, PayDisini untuk pembayaran
- **Multi-role**: User, Reseller, Admin dengan harga berbeda
- **Responsive Design**: Mobile-first design dengan Tailwind CSS

### 4. Keamanan
- **Password Hashing**: Menggunakan password_hash() PHP
- **CSRF Protection**: Token CSRF untuk semua form
- **Input Validation**: Validasi server-side untuk semua input
- **SQL Injection**: Menggunakan prepared statements
- **XSS Protection**: Output encoding untuk semua user input

### 5. Konfigurasi Environment
```php
// config/app.php
return [
    'app_name' => 'Pulsa Indonesia',
    'app_url' => 'https://yourdomain.com',
    'database' => [
        'host' => 'localhost',
        'name' => 'pulsa_db',
        'user' => 'db_user',
        'pass' => 'db_password'
    ],
    'digiflazz' => [
        'username' => env('DIGIFLAZZ_USERNAME'),
        'api_key' => env('DIGIFLAZZ_API_KEY'),
        'base_url' => 'https://api.digiflazz.com/v1'
    ],
    'paydisini' => [
        'api_key' => env('PAYDISINI_API_KEY'),
        'base_url' => 'https://paydisini.co.id/api'
    ]
];
```

## Perbandingan dengan Versi Node.js

| Aspek | Node.js Version | PHP Version |
|-------|-----------------|-------------|
| Runtime | Node.js + Express | PHP 8.1+ + Laravel/CI4 |
| Database ORM | Drizzle ORM | Eloquent/Query Builder |
| Frontend Build | Vite + React | Webpack/Vite + Blade/Twig |
| Session Store | PostgreSQL | Database/Redis |
| Package Manager | npm | Composer |
| Deployment | Replit/Vercel | Shared hosting/VPS |

## Keunggulan Versi PHP
1. **Hosting Murah**: Bisa di-hosting di shared hosting dengan biaya rendah
2. **Mudah Deploy**: Tidak butuh Node.js environment
3. **Familiar**: Banyak developer Indonesia yang familiar dengan PHP
4. **Dokumentasi**: Banyak tutorial dan dokumentasi dalam bahasa Indonesia
5. **Community**: Komunitas PHP Indonesia yang besar dan aktif

Versi PHP ini akan memiliki tampilan dan fungsionalitas yang sama persis dengan versi Node.js, namun dengan teknologi yang lebih familiar untuk developer Indonesia.