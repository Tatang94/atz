<?php
/**
 * PayDisini Payment Gateway Integration
 * Real API integration untuk payment processing
 */

class PayDisini {
    private $api_key;
    private $base_url = 'https://paydisini.co.id/api/';
    
    public function __construct($api_key = null) {
        $this->api_key = $api_key ?: PAYDISINI_API_KEY;
    }
    
    /**
     * Generate signature untuk PayDisini API
     */
    private function generateSignature($unique_code, $service, $amount, $valid_time, $note) {
        $data = $this->api_key . $unique_code . $service . $amount . $valid_time . $note;
        return md5($data);
    }
    
    /**
     * Create payment request ke PayDisini
     */
    public function createPayment($unique_code, $service_id, $amount, $note, $valid_time = '1800') {
        if (empty($this->api_key)) {
            throw new Exception('PayDisini API Key belum dikonfigurasi');
        }
        
        $signature = $this->generateSignature($unique_code, $service_id, $amount, $valid_time, $note);
        
        $postData = [
            'key' => $this->api_key,
            'request' => 'new',
            'unique_code' => $unique_code,
            'service' => $service_id,
            'amount' => $amount,
            'note' => $note,
            'valid_time' => $valid_time,
            'type_fee' => '1',
            'payment_guide' => 'true',
            'signature' => $signature
        ];
        
        $response = $this->makeRequest($postData);
        
        if (!$response['success']) {
            throw new Exception('PayDisini Error: ' . $response['msg']);
        }
        
        return $response;
    }
    
    /**
     * Check payment status
     */
    public function checkPaymentStatus($unique_code) {
        if (empty($this->api_key)) {
            throw new Exception('PayDisini API Key belum dikonfigurasi');
        }
        
        $signature = md5($this->api_key . $unique_code);
        
        $postData = [
            'key' => $this->api_key,
            'request' => 'status',
            'unique_code' => $unique_code,
            'signature' => $signature
        ];
        
        $response = $this->makeRequest($postData);
        
        if (!$response['success']) {
            throw new Exception('PayDisini Error: ' . $response['msg']);
        }
        
        return $response;
    }
    
    /**
     * Get available payment methods
     */
    public function getPaymentMethods() {
        if (empty($this->api_key)) {
            throw new Exception('PayDisini API Key belum dikonfigurasi');
        }
        
        $signature = md5($this->api_key);
        
        $postData = [
            'key' => $this->api_key,
            'request' => 'payment_guide',
            'signature' => $signature
        ];
        
        $response = $this->makeRequest($postData);
        
        if (!$response['success']) {
            throw new Exception('PayDisini Error: ' . $response['msg']);
        }
        
        return $response;
    }
    
    /**
     * Make HTTP request ke PayDisini API
     */
    private function makeRequest($postData) {
        $ch = curl_init();
        
        curl_setopt_array($ch, [
            CURLOPT_URL => $this->base_url,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => http_build_query($postData),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/x-www-form-urlencoded'
            ]
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        
        if (curl_error($ch)) {
            curl_close($ch);
            throw new Exception('CURL Error: ' . curl_error($ch));
        }
        
        curl_close($ch);
        
        if ($httpCode !== 200) {
            throw new Exception('HTTP Error: ' . $httpCode);
        }
        
        $decoded = json_decode($response, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON response: ' . json_last_error_msg());
        }
        
        return $decoded;
    }
    
    /**
     * Get service ID berdasarkan payment method
     */
    public static function getServiceId($payment_method) {
        $services = [
            'qris' => '11',
            'bca' => '26', 
            'bni' => '27',
            'bri' => '28',
            'mandiri' => '29',
            'gopay' => '18',
            'ovo' => '17',
            'dana' => '13',
            'linkaja' => '20',
            'alfamart' => '33',
            'indomaret' => '34'
        ];
        
        return isset($services[$payment_method]) ? $services[$payment_method] : '11'; // Default QRIS
    }
    
    /**
     * Format amount untuk PayDisini (integer format)
     */
    public static function formatAmount($amount) {
        return (string) intval($amount);
    }
    
    /**
     * Generate unique transaction code
     */
    public static function generateUniqueCode() {
        return 'TXN' . time() . mt_rand(1000, 9999);
    }
}

/**
 * Helper function untuk membuat payment
 */
function createPayDisiniPayment($product, $customer_data, $payment_method = 'qris') {
    try {
        $payDisini = new PayDisini();
        
        $unique_code = PayDisini::generateUniqueCode();
        $service_id = PayDisini::getServiceId($payment_method);
        $amount = PayDisini::formatAmount($product['price']);
        $note = "Pembelian " . $product['product_name'] . " - " . $customer_data;
        
        $payment = $payDisini->createPayment($unique_code, $service_id, $amount, $note);
        
        return [
            'success' => true,
            'unique_code' => $unique_code,
            'payment_url' => $payment['data']['checkout_url'],
            'qr_url' => $payment['data']['qrcode_url'] ?? null,
            'amount' => $amount,
            'expired' => $payment['data']['expired'],
            'payment_data' => $payment['data']
        ];
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => $e->getMessage()
        ];
    }
}

/**
 * Helper function untuk check payment status
 */
function checkPayDisiniStatus($unique_code) {
    try {
        $payDisini = new PayDisini();
        $status = $payDisini->checkPaymentStatus($unique_code);
        
        return [
            'success' => true,
            'status' => $status['data']['status'],
            'amount' => $status['data']['amount'],
            'data' => $status['data']
        ];
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => $e->getMessage()
        ];
    }
}

/**
 * Helper function untuk get payment methods
 */
function getPayDisiniMethods() {
    try {
        $payDisini = new PayDisini();
        $methods = $payDisini->getPaymentMethods();
        
        return [
            'success' => true,
            'methods' => $methods['data']
        ];
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => $e->getMessage()
        ];
    }
}
?>