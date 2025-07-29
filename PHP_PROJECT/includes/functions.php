<?php
// Fungsi untuk mendapatkan jumlah produk per kategori
function getProductCategories() {
    global $pdo;
    
    try {
        $stmt = $pdo->query("
            SELECT category, COUNT(*) as count 
            FROM products 
            WHERE status = 'active' AND is_available = 1 
            GROUP BY category
        ");
        
        $categories = [
            'pulsa' => 0,
            'data' => 0,
            'games' => 0,
            'voucher' => 0,
            'emoney' => 0,
            'pln' => 0,
            'china_topup' => 0,
            'malaysia_topup' => 0,
            'philippines_topup' => 0,
            'singapore_topup' => 0,
            'thailand_topup' => 0,
            'sms_telpon' => 0,
            'vietnam_topup' => 0,
            'streaming_tv' => 0,
            'aktivasi_voucher' => 0,
            'masa_aktif' => 0,
            'bundling' => 0,
            'aktivasi_perdana' => 0,
            'gas' => 0,
            'esim' => 0,
            'media_sosial' => 0
        ];
        
        while ($row = $stmt->fetch()) {
            $categories[$row['category']] = (int)$row['count'];
        }
        
        return $categories;
    } catch (PDOException $e) {
        return [
            'pulsa' => 0, 'data' => 0, 'games' => 0, 'voucher' => 0, 'emoney' => 0,
            'pln' => 0, 'china_topup' => 0, 'malaysia_topup' => 0, 'philippines_topup' => 0,
            'singapore_topup' => 0, 'thailand_topup' => 0, 'sms_telpon' => 0, 'vietnam_topup' => 0,
            'streaming_tv' => 0, 'aktivasi_voucher' => 0, 'masa_aktif' => 0, 'bundling' => 0,
            'aktivasi_perdana' => 0, 'gas' => 0, 'esim' => 0, 'media_sosial' => 0
        ];
    }
}

// Fungsi untuk mendapatkan produk berdasarkan kategori
function getProductsByCategory($category) {
    global $pdo;
    
    try {
        $stmt = $pdo->prepare("
            SELECT * FROM products 
            WHERE category = ? AND status = 'active' AND is_available = 1 
            ORDER BY price ASC
        ");
        $stmt->execute([$category]);
        
        return $stmt->fetchAll();
    } catch (PDOException $e) {
        return [];
    }
}

// Fungsi untuk mendapatkan produk berdasarkan ID
function getProductById($id) {
    global $pdo;
    
    try {
        $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ? AND status = 'active'");
        $stmt->execute([$id]);
        
        return $stmt->fetch();
    } catch (PDOException $e) {
        return null;
    }
}

// Fungsi untuk membuat transaksi baru
function createTransaction($product_id, $customer_data, $amount) {
    global $pdo;
    
    try {
        $transaction_id = 'TRX-' . date('YmdHis') . '-' . rand(1000, 9999);
        
        $stmt = $pdo->prepare("
            INSERT INTO transactions (transaction_id, product_id, customer_phone, amount, status, created_at)
            VALUES (?, ?, ?, ?, 'pending', NOW())
        ");
        
        $stmt->execute([$transaction_id, $product_id, $customer_data, $amount]);
        
        return [
            'success' => true,
            'transaction_id' => $transaction_id,
            'id' => $pdo->lastInsertId()
        ];
    } catch (PDOException $e) {
        return [
            'success' => false,
            'message' => 'Gagal membuat transaksi: ' . $e->getMessage()
        ];
    }
}

// Fungsi untuk mendapatkan transaksi berdasarkan ID
function getTransactionById($id) {
    global $pdo;
    
    try {
        $stmt = $pdo->prepare("
            SELECT t.*, p.product_name, p.operator 
            FROM transactions t 
            JOIN products p ON t.product_id = p.id 
            WHERE t.id = ?
        ");
        $stmt->execute([$id]);
        
        return $stmt->fetch();
    } catch (PDOException $e) {
        return null;
    }
}

// Fungsi untuk update status transaksi
function updateTransactionStatus($transaction_id, $status, $reference = null) {
    global $pdo;
    
    try {
        $sql = "UPDATE transactions SET status = ?, updated_at = NOW()";
        $params = [$status];
        
        if ($reference) {
            $sql .= ", payment_reference = ?";
            $params[] = $reference;
        }
        
        $sql .= " WHERE transaction_id = ?";
        $params[] = $transaction_id;
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        
        return $stmt->rowCount() > 0;
    } catch (PDOException $e) {
        return false;
    }
}

// Fungsi untuk mendapatkan statistik dashboard
function getDashboardStats() {
    global $pdo;
    
    try {
        // Total transaksi hari ini
        $stmt = $pdo->query("
            SELECT COUNT(*) as total_transactions,
                   COALESCE(SUM(amount), 0) as total_revenue
            FROM transactions 
            WHERE DATE(created_at) = CURDATE()
        ");
        $today_stats = $stmt->fetch();
        
        // Total transaksi sukses
        $stmt = $pdo->query("
            SELECT COUNT(*) as success_transactions
            FROM transactions 
            WHERE status = 'success'
        ");
        $success_stats = $stmt->fetch();
        
        // Total produk aktif
        $stmt = $pdo->query("
            SELECT COUNT(*) as total_products
            FROM products 
            WHERE status = 'active'
        ");
        $product_stats = $stmt->fetch();
        
        return [
            'total_transactions' => (int)$today_stats['total_transactions'],
            'total_revenue' => (float)$today_stats['total_revenue'],
            'success_transactions' => (int)$success_stats['success_transactions'],
            'total_products' => (int)$product_stats['total_products']
        ];
    } catch (PDOException $e) {
        return [
            'total_transactions' => 0,
            'total_revenue' => 0,
            'success_transactions' => 0,
            'total_products' => 0
        ];
    }
}

// Fungsi untuk mendapatkan setting
function getSetting($key, $default = '') {
    global $pdo;
    
    try {
        $stmt = $pdo->prepare("SELECT setting_value FROM settings WHERE setting_key = ?");
        $stmt->execute([$key]);
        
        $result = $stmt->fetch();
        return $result ? $result['setting_value'] : $default;
    } catch (PDOException $e) {
        return $default;
    }
}

// Fungsi untuk update setting
function updateSetting($key, $value) {
    global $pdo;
    
    try {
        $stmt = $pdo->prepare("
            INSERT INTO settings (setting_key, setting_value, updated_at) 
            VALUES (?, ?, NOW())
            ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = NOW()
        ");
        
        $stmt->execute([$key, $value]);
        return true;
    } catch (PDOException $e) {
        return false;
    }
}

// Fungsi untuk format mata uang
function formatCurrency($amount) {
    return 'Rp ' . number_format($amount, 0, ',', '.');
}

// Fungsi untuk generate response JSON
function jsonResponse($data, $status_code = 200) {
    http_response_code($status_code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

// Fungsi untuk validasi nomor HP
function validatePhoneNumber($phone) {
    $phone = preg_replace('/\D/', '', $phone);
    return strlen($phone) >= 10 && strlen($phone) <= 15;
}

// Fungsi untuk deteksi operator
function detectOperator($phone) {
    $phone = preg_replace('/\D/', '', $phone);
    
    if (preg_match('/^(0811|0812|0813|0821|0822|0823)/', $phone)) {
        return 'Telkomsel';
    } elseif (preg_match('/^(0817|0818|0819|0859|0877|0878)/', $phone)) {
        return 'XL';
    } elseif (preg_match('/^(0814|0815|0816|0855|0856|0857|0858)/', $phone)) {
        return 'Indosat';
    } elseif (preg_match('/^(0832|0833|0838)/', $phone)) {
        return 'Axis';
    }
    
    return 'Unknown';
}
?>