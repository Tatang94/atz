<?php
require_once '../config/app.php';
require_once '../includes/functions.php';
require_once '../includes/paydisini.php';

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
        
        // Get payment method from request
        $payment_method = $data['payment_method'] ?? 'qris';
        
        // Create payment dengan PayDisini API yang real
        $payment_result = createPayDisiniPayment($product, $customer_data, $payment_method);
        
        if (!$payment_result['success']) {
            jsonResponse(['success' => false, 'message' => $payment_result['message']], 500);
        }
        
        // Buat transaksi record di database
        $result = createTransaction($product_id, $customer_data, $product['price'], $payment_result['unique_code']);
        
        if ($result['success']) {
            jsonResponse([
                'success' => true,
                'message' => 'Transaksi berhasil dibuat',
                'transaction_id' => $result['transaction_id'],
                'payment_url' => $payment_result['payment_url'],
                'qr_url' => $payment_result['qr_url'],
                'unique_code' => $payment_result['unique_code'],
                'amount' => $payment_result['amount'],
                'expired' => $payment_result['expired']
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