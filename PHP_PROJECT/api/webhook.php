<?php
require_once '../config/app.php';
require_once '../includes/functions.php';
require_once '../includes/paydisini.php';

header('Content-Type: application/json');

// Webhook endpoint untuk callback PayDisini
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Log raw input untuk debugging
        $raw_input = file_get_contents('php://input');
        error_log("PayDisini Webhook: " . $raw_input);
        
        $data = json_decode($raw_input, true);
        
        if (!$data) {
            // Coba ambil dari POST data biasa
            $data = $_POST;
        }
        
        // Validasi required fields
        if (!isset($data['unique_code']) || !isset($data['status'])) {
            jsonResponse(['success' => false, 'message' => 'Missing required fields'], 400);
        }
        
        $unique_code = $data['unique_code'];
        $payment_status = $data['status'];
        $amount = $data['amount'] ?? 0;
        
        // Log callback data
        error_log("PayDisini Callback - Code: $unique_code, Status: $payment_status, Amount: $amount");
        
        // Update status transaksi berdasarkan status PayDisini
        $new_status = 'pending';
        
        switch (strtolower($payment_status)) {
            case 'success':
            case 'paid':
                $new_status = 'paid';
                break;
            case 'expired':
            case 'failed':
            case 'cancelled':
                $new_status = 'failed';
                break;
            default:
                $new_status = 'pending';
        }
        
        // Update status di database
        $updated = updateTransactionByReference($unique_code, $new_status);
        
        if ($updated) {
            // Jika payment berhasil, bisa ditambahkan logic untuk proses ke Digiflazz
            if ($new_status === 'paid') {
                // TODO: Integrate dengan Digiflazz untuk proses produk
                // Untuk sekarang, langsung update status ke success
                updateTransactionByReference($unique_code, 'success');
                
                error_log("Payment successful for $unique_code, amount: $amount");
            }
            
            jsonResponse([
                'success' => true,
                'message' => 'Webhook processed successfully',
                'unique_code' => $unique_code,
                'status' => $new_status
            ]);
        } else {
            error_log("Failed to update transaction for unique_code: $unique_code");
            jsonResponse(['success' => false, 'message' => 'Transaction not found or update failed'], 404);
        }
        
    } catch (Exception $e) {
        error_log("PayDisini Webhook Error: " . $e->getMessage());
        jsonResponse(['success' => false, 'message' => 'Internal server error'], 500);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Endpoint untuk test webhook
    jsonResponse([
        'success' => true,
        'message' => 'PayDisini webhook endpoint is ready',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
} else {
    jsonResponse(['error' => 'Method not allowed'], 405);
}
?>