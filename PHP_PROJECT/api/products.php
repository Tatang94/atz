<?php
require_once '../config/app.php';
require_once '../includes/functions.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    $category = $_GET['category'] ?? '';
    
    if (empty($category)) {
        jsonResponse(['error' => 'Category is required'], 400);
    }
    
    $products = getProductsByCategory($category);
    jsonResponse($products);
} catch (Exception $e) {
    jsonResponse(['error' => 'Failed to load products'], 500);
}
?>