<?php
require_once '../config/app.php';
require_once '../includes/functions.php';
require_once '../includes/paydisini.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        $unique_code = $data['unique_code'] ?? '';
        
        if (empty($unique_code)) {
            jsonResponse(['success' => false, 'message' => 'Unique code is required'], 400);
        }
        
        // Check payment status dari PayDisini
        $status_result = checkPayDisiniStatus($unique_code);
        
        if (!$status_result['success']) {
            jsonResponse(['success' => false, 'message' => $status_result['message']], 500);
        }
        
        // Update status di database
        $payment_status = $status_result['status'];
        $db_status = 'pending';
        
        if ($payment_status === 'Success') {
            $db_status = 'paid';
        } elseif ($payment_status === 'Expired' || $payment_status === 'Failed') {
            $db_status = 'failed';
        }
        
        // Update transaction status
        updateTransactionByReference($unique_code, $db_status);
        
        jsonResponse([
            'success' => true,
            'status' => $db_status,
            'payment_status' => $payment_status,
            'amount' => $status_result['amount']
        ]);
        
    } catch (Exception $e) {
        jsonResponse(['success' => false, 'message' => 'Terjadi kesalahan server'], 500);
    }
} else {
    jsonResponse(['error' => 'Method not allowed'], 405);
}
?>