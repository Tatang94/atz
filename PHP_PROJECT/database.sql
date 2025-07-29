-- Database Schema untuk Aplikasi Pulsa Indonesia PHP

CREATE DATABASE IF NOT EXISTS pulsa_indonesia;
USE pulsa_indonesia;

-- Tabel Products (Produk)
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    provider_id VARCHAR(100) NOT NULL,
    category ENUM('pulsa', 'data', 'pln', 'game', 'ewallet') NOT NULL,
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
('TSEL5', 'pulsa', 'Telkomsel', 'Pulsa Telkomsel 5.000', 'Pulsa reguler Telkomsel 5 ribu', 5500.00, 'active'),
('TSEL10', 'pulsa', 'Telkomsel', 'Pulsa Telkomsel 10.000', 'Pulsa reguler Telkomsel 10 ribu', 10500.00, 'active'),
('XL5', 'pulsa', 'XL', 'Pulsa XL 5.000', 'Pulsa reguler XL 5 ribu', 5500.00, 'active'),
('ISAT5', 'pulsa', 'Indosat', 'Pulsa Indosat 5.000', 'Pulsa reguler Indosat 5 ribu', 5500.00, 'active'),
('TSEL1GB', 'data', 'Telkomsel', 'Data Telkomsel 1GB', 'Paket data Telkomsel 1GB 30 hari', 15000.00, 'active'),
('XL1GB', 'data', 'XL', 'Data XL 1GB', 'Paket data XL 1GB 30 hari', 14000.00, 'active'),
('PLN20', 'pln', 'PLN', 'Token PLN 20.000', 'Token listrik PLN 20 ribu', 20500.00, 'active'),
('PLN50', 'pln', 'PLN', 'Token PLN 50.000', 'Token listrik PLN 50 ribu', 50500.00, 'active'),
('MLBB50', 'game', 'Mobile Legends', 'Mobile Legends 50 Diamond', 'Diamond Mobile Legends 50', 15000.00, 'active'),
('FF50', 'game', 'Free Fire', 'Free Fire 50 Diamond', 'Diamond Free Fire 50', 8000.00, 'active'),
('GOPAY25', 'ewallet', 'GoPay', 'GoPay 25.000', 'Top up GoPay 25 ribu', 25500.00, 'active'),
('OVO25', 'ewallet', 'OVO', 'OVO 25.000', 'Top up OVO 25 ribu', 25500.00, 'active');