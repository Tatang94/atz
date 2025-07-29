<?php
require_once '../config/app.php';
require_once '../includes/functions.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    $categories = getProductCategories();
    jsonResponse($categories);
} catch (Exception $e) {
    jsonResponse(['error' => 'Failed to load categories'], 500);
}
?>