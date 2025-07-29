# Aplikasi Pulsa Indonesia - Versi PHP

## Gambaran Umum
Aplikasi pulsa Indonesia versi PHP lengkap dengan splash screen animasi dan design yang sama dengan versi Replit. Aplikasi ini dibuat tanpa sistem login/register, memungkinkan transaksi instan tanpa perlu membuat akun.

## Fitur Utama
- ✨ **Splash Screen Animasi** - Tampilan pembuka yang menarik dengan loading progress
- 🚀 **Transaksi Tanpa Akun** - Langsung belanja tanpa perlu registrasi
- 📱 **Mobile-First Design** - Responsive design untuk semua perangkat
- 🛒 **Multi Kategori** - Pulsa, Data, PLN, Game, E-Wallet
- 🎮 **Admin Dashboard** - Panel admin lengkap dengan statistik real-time
- 🔧 **Konfigurasi API** - Setting Digiflazz dan PayDisini melalui web interface

## Instalasi

### 1. Setup Database
```sql
-- Import file database.sql ke MySQL/MariaDB
mysql -u root -p < database.sql
```

### 2. Konfigurasi Database
Edit file `config/app.php`:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'pulsa_indonesia');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
```

### 3. Setup Web Server
- **Apache/Nginx**: Arahkan document root ke folder PHP_PROJECT
- **PHP Built-in Server**: `php -S localhost:8000`

### 4. Konfigurasi API
1. Buka `/admin` di browser
2. Masukkan kredensial Digiflazz dan PayDisini
3. Sinkronisasi produk dari Digiflazz

## Struktur File
```
PHP_PROJECT/
├── index.php              # Router utama
├── config/
│   └── app.php            # Konfigurasi database & API
├── views/
│   ├── splash.php         # Halaman splash screen
│   ├── home.php           # Halaman utama
│   ├── admin/
│   │   └── dashboard.php  # Dashboard admin
│   └── 404.php            # Halaman error 404
├── api/
│   ├── categories.php     # API kategori produk
│   ├── products.php       # API daftar produk
│   └── transaction.php    # API pembuatan transaksi
├── includes/
│   └── functions.php      # Fungsi-fungsi utility
└── database.sql           # Schema database
```

## Fitur Splash Screen
- **Loading Animation** - Progress bar dengan tahapan loading realistis
- **Feature Showcase** - Menampilkan keunggulan aplikasi
- **Auto Navigation** - Otomatis masuk ke aplikasi setelah loading selesai
- **Manual Entry** - Tombol "Mulai Belanja" untuk masuk manual

## Dashboard Admin
Akses melalui `/admin` untuk:
- **Statistik Real-time** - Transaksi hari ini, revenue, success rate
- **Konfigurasi API** - Setting Digiflazz dan PayDisini
- **Manajemen Produk** - Sinkronisasi dan kelola produk
- **Riwayat Transaksi** - Monitor semua transaksi

## Kategori Produk
1. **Pulsa** - Pulsa reguler semua operator
2. **Paket Data** - Paket internet/data
3. **Token PLN** - Token listrik prabayar
4. **Voucher Game** - Diamond Mobile Legends, Free Fire, dll
5. **E-Wallet** - Top up GoPay, OVO, DANA, dll

## Teknologi
- **Backend**: PHP 8.1+ (Native, tanpa framework)
- **Database**: MySQL 8.0 / MariaDB 10.3+
- **Frontend**: HTML5, Tailwind CSS, Alpine.js
- **Icons**: Lucide Icons
- **API Integration**: Digiflazz, PayDisini

## Keunggulan Versi PHP
1. **Hosting Murah** - Bisa dijalankan di shared hosting
2. **Setup Mudah** - Tidak perlu Node.js environment
3. **Performance** - Loading cepat dengan PHP native
4. **Compatibility** - Support hampir semua hosting provider
5. **Maintenance** - Mudah dimaintain tanpa dependency complex

## Cara Penggunaan
1. **User Experience**:
   - Buka website → Splash screen → Pilih kategori → Pilih produk → Bayar
   - Tidak perlu registrasi atau login

2. **Admin Experience**:
   - Akses `/admin` → Setup API keys → Sinkronisasi produk → Monitor transaksi

## API Endpoints
- `GET /api/categories` - Ambil jumlah produk per kategori
- `GET /api/products?category=pulsa` - Ambil produk per kategori
- `POST /api/transaction` - Buat transaksi baru

## Browser Support
- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Production Deployment
1. Upload semua file ke hosting
2. Import database.sql
3. Edit config/app.php sesuai hosting
4. Set permission folder yang diperlukan
5. Akses `/admin` untuk konfigurasi API

## Demo Data
Database sudah include sample data untuk testing:
- Produk Telkomsel, XL, Indosat, Axis
- Token PLN berbagai nominal
- Voucher game populer (Mobile Legends, Free Fire)
- E-wallet (GoPay, OVO, DANA)

Design dan user experience persis sama dengan versi Replit, hanya teknologi backend yang berbeda untuk kemudahan hosting dan maintenance.