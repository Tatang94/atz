<?php
require_once '../config/app.php';
require_once '../includes/functions.php';
require_once '../includes/paydisini.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Get payment methods dari PayDisini
        $methods_result = getPayDisiniMethods();
        
        if (!$methods_result['success']) {
            jsonResponse(['success' => false, 'message' => $methods_result['message']], 500);
        }
        
        // Format payment methods untuk frontend
        $formatted_methods = [
            [
                'id' => 'qris',
                'name' => 'QRIS',
                'icon' => 'qr-code',
                'service_id' => '11'
            ],
            [
                'id' => 'gopay',
                'name' => 'GoPay',
                'icon' => 'smartphone',
                'service_id' => '18'
            ],
            [
                'id' => 'ovo',
                'name' => 'OVO',
                'icon' => 'smartphone',
                'service_id' => '17'
            ],
            [
                'id' => 'dana',
                'name' => 'DANA',
                'icon' => 'smartphone',
                'service_id' => '13'
            ],
            [
                'id' => 'linkaja',
                'name' => 'LinkAja',
                'icon' => 'smartphone',
                'service_id' => '20'
            ],
            [
                'id' => 'bca',
                'name' => 'BCA Virtual Account',
                'icon' => 'building-2',
                'service_id' => '26'
            ],
            [
                'id' => 'bni',
                'name' => 'BNI Virtual Account',
                'icon' => 'building-2',
                'service_id' => '27'
            ],
            [
                'id' => 'bri',
                'name' => 'BRI Virtual Account',
                'icon' => 'building-2',
                'service_id' => '28'
            ],
            [
                'id' => 'mandiri',
                'name' => 'Mandiri Virtual Account',
                'icon' => 'building-2',
                'service_id' => '29'
            ],
            [
                'id' => 'alfamart',
                'name' => 'Alfamart',
                'icon' => 'store',
                'service_id' => '33'
            ],
            [
                'id' => 'indomaret',
                'name' => 'Indomaret',
                'icon' => 'store',
                'service_id' => '34'
            ]
        ];
        
        jsonResponse([
            'success' => true,
            'methods' => $formatted_methods
        ]);
        
    } catch (Exception $e) {
        jsonResponse(['success' => false, 'message' => 'Terjadi kesalahan server'], 500);
    }
} else {
    jsonResponse(['error' => 'Method not allowed'], 405);
}
?>