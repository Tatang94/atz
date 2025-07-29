<?php
require_once '../config/app.php';
require_once '../includes/functions.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $product_id = $input['product_id'] ?? 0;
        $customer_data = $input['customer_data'] ?? '';
        $amount = $input['amount'] ?? 0;
        
        if (empty($product_id) || empty($customer_data) || empty($amount)) {
            jsonResponse(['success' => false, 'message' => 'Data tidak lengkap'], 400);
        }
        
        // Validasi produk
        $product = getProductById($product_id);
        if (!$product) {
            jsonResponse(['success' => false, 'message' => 'Produk tidak ditemukan'], 404);
        }
        
        // Validasi customer data berdasarkan kategori
        if (in_array($product['category'], ['pulsa', 'data', 'emoney', 'sms_telpon', 'masa_aktif', 'aktivasi_perdana', 'esim'])) {
            if (!validatePhoneNumber($customer_data)) {
                jsonResponse(['success' => false, 'message' => 'Nomor HP tidak valid'], 400);
            }
        }
        
        // Buat transaksi
        $result = createTransaction($product_id, $customer_data, $amount);
        
        if ($result['success']) {
            // Simulasi URL pembayaran (dalam implementasi nyata, gunakan PayDisini API)
            $payment_url = "https://paydisini.co.id/payment/" . $result['transaction_id'];
            
            jsonResponse([
                'success' => true,
                'message' => 'Transaksi berhasil dibuat',
                'transaction_id' => $result['transaction_id'],
                'payment_url' => $payment_url
            ]);
        } else {
            jsonResponse(['success' => false, 'message' => $result['message']], 500);
        }
        
    } catch (Exception $e) {
        jsonResponse(['success' => false, 'message' => 'Terjadi kesalahan server'], 500);
    }
} else {
    jsonResponse(['error' => 'Method not allowed'], 405);
}
?>