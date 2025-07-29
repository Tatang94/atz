# Indonesian Pulsa & Payment Application - PHP Version

Aplikasi pulsa dan pembayaran Indonesia yang dibangun dengan PHP untuk kemudahan deploy di hosting tradisional.

## Fitur Utama

- ✅ **Splash Screen Animasi** - Loading screen dengan progress bar dan showcase fitur
- ✅ **Tanpa Login/Register** - Langsung transaksi tanpa perlu membuat akun
- ✅ **Mobile-First Design** - Responsive sempurna untuk semua perangkat
- ✅ **Admin Dashboard** - Panel admin dengan statistik real-time
- ✅ **21+ Kategori Produk** - Lengkap dari lokal hingga internasional
- ✅ **Smart Input Forms** - Form otomatis menyesuaikan kategori
- ✅ **Beautiful UI/UX** - Gradient icons dan hover effects
- ✅ **API Ready** - REST API endpoints untuk integrasi
- ✅ **Database Optimized** - MySQL schema yang efisien

## Kategori Produk Lengkap

### 📱 **Telekomunikasi Lokal**
- **Pulsa** - Isi ulang semua operator Indonesia
- **Data** - Paket internet untuk semua provider
- **SMS & Telpon** - Paket komunikasi
- **Masa Aktif** - Perpanjang masa aktif kartu
- **Bundling** - Paket combo data + pulsa
- **Aktivasi Perdana** - Aktivasi kartu baru
- **Aktivasi Voucher** - Aktivasi voucher operator
- **eSIM** - Kartu digital modern

### 🌏 **International Topup**
- **China Topup** - Top up operator China Mobile, Unicom
- **Malaysia Topup** - Maxis, Celcom, Digi Malaysia  
- **Philippines Topup** - Globe, Smart Philippines
- **Singapore Topup** - Singtel, StarHub Singapore
- **Thailand Topup** - AIS, DTAC Thailand
- **Vietnam Topup** - Viettel, Vinaphone Vietnam

### 💰 **Payment & Digital**
- **E-Money** - GoPay, OVO, DANA, LinkAja
- **Voucher** - Google Play, Steam, iTunes
- **Games** - Mobile Legends, Free Fire, PUBG, dll
- **PLN** - Token listrik prabayar
- **Gas** - Top up gas PGN

### 🎬 **Entertainment & Social**
- **Streaming TV** - Netflix, Disney+, HBO, Prime Video
- **Media Sosial** - Instagram followers, TikTok coins

## Struktur Folder

```
PHP_PROJECT/
├── index.php              # Router utama
├── database.sql           # Schema database & data sample lengkap
├── config/
│   └── app.php            # Konfigurasi database & API
├── views/
│   ├── splash.php         # Splash screen dengan animasi
│   ├── home.php           # Halaman utama customer (21+ kategori)
│   ├── admin/
│   │   └── dashboard.php  # Dashboard admin lengkap
│   └── 404.php            # Error page
├── api/
│   ├── categories.php     # API kategori produk
│   ├── products.php       # API produk
│   └── transaction.php    # API transaksi
└── includes/
    └── functions.php      # Fungsi utility
```

## Instalasi

### 1. Upload ke Hosting
```bash
# Upload semua file PHP_PROJECT ke public_html atau folder website
```

### 2. Setup Database
```sql
-- Buat database baru
CREATE DATABASE pulsa_indonesia;

-- Import schema dengan sample data lengkap
mysql -u username -p pulsa_indonesia < database.sql
```

### 3. Konfigurasi Database
Edit file `config/app.php`:
```php
$config = [
    'db_host' => 'localhost',      // Host database
    'db_user' => 'username',       // Username database  
    'db_pass' => 'password',       // Password database
    'db_name' => 'pulsa_indonesia', // Nama database
    
    // API Configuration (opsional untuk testing)
    'digiflazz_username' => '',
    'digiflazz_api_key' => '',
    'paydisini_api_key' => '',
    'markup_percentage' => 5
];
```

### 4. Set Permissions
```bash
chmod 755 -R PHP_PROJECT/
chmod 644 PHP_PROJECT/config/app.php
```

## Penggunaan

### Customer Experience
1. **Splash Screen** - Loading animasi dengan showcase fitur
2. **Category Selection** - 21+ kategori dengan gradient icons
3. **Smart Forms** - Input form menyesuaikan kategori:
   - Nomor HP → Pulsa, Data, E-Money, SMS, dll
   - Email → Voucher, Streaming TV
   - User ID → Games
   - Customer ID → PLN, Gas
   - International Phone → Topup luar negeri
4. **Product Selection** - Daftar produk sesuai kategori
5. **Transaction** - Konfirmasi dan pembayaran
6. **Real-time Status** - Update otomatis

### Admin Dashboard
- **Akses**: `yoursite.com/?page=admin`
- **Statistik Real-time**: Total transaksi, revenue, produk
- **Product Management**: CRUD produk semua kategori
- **API Configuration**: Setting Digiflazz, PayDisini
- **Transaction Monitoring**: Track semua transaksi

## UI/UX Features

### 🎨 **Beautiful Design**
- **Gradient Icons** - 21+ kategori dengan warna unik
- **Hover Effects** - Transform scale dan shadow
- **Responsive Grid** - 2-6 kolom otomatis
- **Smart Typography** - Font sizing yang tepat

### 📱 **Mobile Optimization**  
- **Touch-friendly** - Button size optimal untuk mobile
- **Readable Text** - Contrast ratio tinggi
- **Fast Loading** - Optimized assets dan CDN
- **Swipe Support** - Smooth scrolling

## API Endpoints

### Categories
```http
GET /api/categories.php
Response: {
  "pulsa": 12, "data": 8, "games": 25, "voucher": 15,
  "emoney": 10, "pln": 5, "china_topup": 3, 
  "malaysia_topup": 3, "philippines_topup": 3,
  "singapore_topup": 3, "thailand_topup": 3,
  "vietnam_topup": 3, "streaming_tv": 8, "media_sosial": 5
}
```

### Products by Category
```http
GET /api/products.php?category=games
Response: [
  {
    "id": 1,
    "provider_id": "MLBB50", 
    "operator": "Mobile Legends",
    "product_name": "Mobile Legends 50 Diamond",
    "price": 15000,
    "status": "active"
  }
]
```

### Create Transaction
```http
POST /api/transaction.php
Content-Type: application/json

{
  "product_id": 1,
  "customer_data": "081234567890",
  "payment_method": "qris"
}

Response: {
  "success": true,
  "transaction_id": "TXN001",
  "payment_url": "https://payment.gateway/pay/xxx",
  "amount": 15000
}
```

## Customization Guide

### 🔧 **Tambah Kategori Baru**
1. **Database**: Update ENUM di table `products`
2. **Backend**: Tambah di `includes/functions.php`
3. **Frontend**: Tambah kategori di `views/home.php`
4. **Form**: Tambah input logic sesuai kebutuhan

### 🎨 **Custom Styling**
```html
<!-- Tambah kategori baru dengan gradient unik -->
<div class="bg-gradient-to-br from-purple-100 to-purple-200 hover:border-purple-200">
  <i data-lucide="new-icon" class="w-7 h-7 text-purple-600"></i>
  <h3>Kategori Baru</h3>
</div>
```

### 🔌 **Integrasi Payment Gateway**
Edit `api/transaction.php`:
```php
// Tambah provider payment baru
function createPayment($product, $customer_data) {
    // Your payment gateway integration
    return $payment_url;
}
```

## Production Deployment

### ✅ **Checklist Deployment**
- [ ] Database credentials di `config/app.php`
- [ ] API keys Digiflazz/PayDisini configured
- [ ] SSL certificate aktif (HTTPS required)
- [ ] Error reporting disabled di production
- [ ] Backup database otomatis  
- [ ] Monitor error logs
- [ ] Test all 21+ kategori transaksi
- [ ] Mobile responsiveness check
- [ ] Load testing untuk traffic tinggi

### 🚀 **Hosting Requirements**
- **PHP**: 7.4+ (recommended 8.1+)
- **MySQL**: 5.7+ atau MariaDB 10.3+
- **Memory**: Minimum 256MB
- **Storage**: 100MB+ untuk growth
- **SSL**: Required untuk payment security

### 🔒 **Security Checklist**
- [ ] Input validation semua form
- [ ] SQL injection protection (prepared statements)
- [ ] XSS protection aktif
- [ ] CSRF tokens untuk admin
- [ ] Rate limiting API endpoints
- [ ] Secure file permissions

## Monitoring & Analytics

### 📊 **Key Metrics**
- Conversion rate per kategori
- Popular products tracking
- Payment success rate
- Mobile vs desktop usage
- Peak transaction hours

### 🔍 **Debugging Tools**
```php
// Enable debug mode
$config['debug'] = true;

// Log all transactions
error_log("Transaction: " . json_encode($data));
```

## Support & Community

- **Documentation**: Lengkap dengan contoh code
- **Sample Data**: 50+ produk sample untuk testing
- **Mobile Optimized**: Perfect untuk semua device
- **Production Ready**: Siap deploy tanpa konfigurasi ribet

## License

Proprietary - All rights reserved. Indonesian Pulsa Application 2025.