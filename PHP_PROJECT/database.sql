-- Database Schema untuk Aplikasi Pulsa Indonesia PHP

CREATE DATABASE IF NOT EXISTS pulsa_indonesia;
USE pulsa_indonesia;

-- Tabel Products (Produk)
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    provider_id VARCHAR(100) NOT NULL,
    category ENUM('pulsa', 'data', 'games', 'voucher', 'emoney', 'pln', 'china_topup', 'malaysia_topup', 'philippines_topup', 'singapore_topup', 'thailand_topup', 'sms_telpon', 'vietnam_topup', 'streaming_tv', 'aktivasi_voucher', 'masa_aktif', 'bundling', 'aktivasi_perdana', 'gas', 'esim', 'media_sosial') NOT NULL,
    operator VARCHAR(50) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_operator (operator),
    INDEX idx_status (status)
);

-- Tabel Transactions (Transaksi)
CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    product_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'processing', 'success', 'failed', 'cancelled') DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    digiflazz_reference VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Tabel Settings (Pengaturan Admin)
CREATE TABLE settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Data default untuk pengaturan
INSERT INTO settings (setting_key, setting_value, description) VALUES
('site_name', 'Pulsa Indonesia', 'Nama website'),
('site_description', 'Platform jual beli pulsa, data, PLN, dan voucher game terpercaya', 'Deskripsi website'),
('digiflazz_username', '', 'Username Digiflazz API'),
('digiflazz_api_key', '', 'API Key Digiflazz'),
('paydisini_api_key', '', 'API Key PayDisini'),
('markup_percentage', '5', 'Persentase markup harga'),
('maintenance_mode', '0', 'Mode maintenance (0=off, 1=on)');

-- Contoh data produk (opsional untuk testing)
INSERT INTO products (provider_id, category, operator, product_name, description, price, status) VALUES
-- Pulsa
('TSEL5', 'pulsa', 'Telkomsel', 'Pulsa Telkomsel 5.000', 'Pulsa reguler Telkomsel 5 ribu', 5500.00, 'active'),
('TSEL10', 'pulsa', 'Telkomsel', 'Pulsa Telkomsel 10.000', 'Pulsa reguler Telkomsel 10 ribu', 10500.00, 'active'),
('XL5', 'pulsa', 'XL', 'Pulsa XL 5.000', 'Pulsa reguler XL 5 ribu', 5500.00, 'active'),
('ISAT5', 'pulsa', 'Indosat', 'Pulsa Indosat 5.000', 'Pulsa reguler Indosat 5 ribu', 5500.00, 'active'),

-- Data
('TSEL1GB', 'data', 'Telkomsel', 'Data Telkomsel 1GB', 'Paket data Telkomsel 1GB 30 hari', 15000.00, 'active'),
('XL1GB', 'data', 'XL', 'Data XL 1GB', 'Paket data XL 1GB 30 hari', 14000.00, 'active'),

-- Games
('MLBB50', 'games', 'Mobile Legends', 'Mobile Legends 50 Diamond', 'Diamond Mobile Legends 50', 15000.00, 'active'),
('FF50', 'games', 'Free Fire', 'Free Fire 50 Diamond', 'Diamond Free Fire 50', 8000.00, 'active'),
('PUBG60', 'games', 'PUBG Mobile', 'PUBG Mobile 60 UC', 'Unknown Cash PUBG Mobile 60', 18000.00, 'active'),

-- Voucher
('GOOGLE10', 'voucher', 'Google Play', 'Google Play Gift Card 10.000', 'Voucher Google Play 10 ribu', 11000.00, 'active'),
('STEAM50', 'voucher', 'Steam', 'Steam Wallet 50.000', 'Steam Wallet Code 50 ribu', 52000.00, 'active'),

-- E-Money
('GOPAY25', 'emoney', 'GoPay', 'GoPay 25.000', 'Top up GoPay 25 ribu', 25500.00, 'active'),
('OVO25', 'emoney', 'OVO', 'OVO 25.000', 'Top up OVO 25 ribu', 25500.00, 'active'),
('DANA25', 'emoney', 'DANA', 'DANA 25.000', 'Top up DANA 25 ribu', 25500.00, 'active'),

-- PLN
('PLN20', 'pln', 'PLN', 'Token PLN 20.000', 'Token listrik PLN 20 ribu', 20500.00, 'active'),
('PLN50', 'pln', 'PLN', 'Token PLN 50.000', 'Token listrik PLN 50 ribu', 50500.00, 'active'),

-- International Topup
('CHINA50', 'china_topup', 'China Mobile', 'China Mobile 50 Yuan', 'Top up China Mobile 50 Yuan', 125000.00, 'active'),
('MY30', 'malaysia_topup', 'Maxis', 'Maxis Malaysia RM30', 'Top up Maxis Malaysia 30 Ringgit', 115000.00, 'active'),
('PH100', 'philippines_topup', 'Globe', 'Globe Philippines 100 Peso', 'Top up Globe Philippines 100 Peso', 45000.00, 'active'),
('SG20', 'singapore_topup', 'Singtel', 'Singtel Singapore $20', 'Top up Singtel Singapore 20 Dollar', 225000.00, 'active'),
('TH100', 'thailand_topup', 'AIS', 'AIS Thailand 100 Baht', 'Top up AIS Thailand 100 Baht', 45000.00, 'active'),
('VN50', 'vietnam_topup', 'Viettel', 'Viettel Vietnam 50.000 VND', 'Top up Viettel Vietnam 50 ribu VND', 35000.00, 'active'),

-- SMS & Telpon
('TSEL_SMS100', 'sms_telpon', 'Telkomsel', 'Paket SMS 100', 'Paket SMS Telkomsel 100 SMS', 5000.00, 'active'),
('XL_TELP60', 'sms_telpon', 'XL', 'Paket Nelpon 60 Menit', 'Paket telepon XL 60 menit', 15000.00, 'active'),

-- Streaming TV
('NETFLIX1', 'streaming_tv', 'Netflix', 'Netflix Premium 1 Bulan', 'Langganan Netflix Premium 30 hari', 165000.00, 'active'),
('DISNEY1', 'streaming_tv', 'Disney+', 'Disney+ Hotstar 1 Bulan', 'Langganan Disney+ Hotstar 30 hari', 39000.00, 'active'),

-- Aktivasi Voucher
('AKTIF_TSEL', 'aktivasi_voucher', 'Telkomsel', 'Aktivasi Kartu Telkomsel', 'Aktivasi perdana Telkomsel', 5000.00, 'active'),

-- Masa Aktif
('MASA_AKTIF30', 'masa_aktif', 'Telkomsel', 'Perpanjang Masa Aktif 30 Hari', 'Perpanjang masa aktif Telkomsel 30 hari', 8000.00, 'active'),

-- Bundling
('BUNDLE_COMBO', 'bundling', 'Indosat', 'Combo Freedom Internet', 'Paket bundling Indosat data + pulsa', 25000.00, 'active'),

-- Aktivasi Perdana
('PERDANA_XL', 'aktivasi_perdana', 'XL', 'Aktivasi Perdana XL', 'Aktivasi kartu perdana XL baru', 7500.00, 'active'),

-- Gas
('PGN20', 'gas', 'PGN', 'PGN Gas 20.000', 'Top up gas PGN 20 ribu', 20500.00, 'active'),

-- eSIM
('ESIM_TSEL', 'esim', 'Telkomsel', 'eSIM Telkomsel', 'Aktivasi eSIM Telkomsel', 25000.00, 'active'),

-- Media Sosial
('IG_BOOST', 'media_sosial', 'Instagram', 'Instagram Followers 1000', 'Boost followers Instagram 1000', 35000.00, 'active'),
('TIKTOK_COIN', 'media_sosial', 'TikTok', 'TikTok Coins 100', 'TikTok Coins 100 koin', 18000.00, 'active');