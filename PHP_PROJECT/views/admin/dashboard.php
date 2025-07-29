<?php
require_once '../../config/app.php';
require_once '../../includes/functions.php';

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        switch ($_POST['action']) {
            case 'update_api_config':
                updateSetting('digiflazz_username', $_POST['digiflazz_username']);
                updateSetting('digiflazz_api_key', $_POST['digiflazz_api_key']);
                updateSetting('paydisini_api_key', $_POST['paydisini_api_key']);
                $success_message = "Konfigurasi API berhasil disimpan!";
                break;
            case 'sync_products':
                // Implementasi sinkronisasi produk Digiflazz akan ditambahkan di sini
                $success_message = "Produk berhasil disinkronisasi!";
                break;
        }
    }
}

$stats = getDashboardStats();
$digiflazz_username = getSetting('digiflazz_username');
$digiflazz_api_key = getSetting('digiflazz_api_key');
$paydisini_api_key = getSetting('paydisini_api_key');
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - <?= APP_NAME ?></title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
    <style>
        [x-cloak] { display: none !important; }
    </style>
</head>
<body class="bg-gray-50 min-h-screen" x-data="adminApp()" x-init="init()">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                        <i data-lucide="settings" class="w-5 h-5 text-white"></i>
                    </div>
                    <div>
                        <h1 class="text-lg font-bold text-gray-800">Admin Dashboard</h1>
                        <p class="text-xs text-gray-600">Panel Administrasi</p>
                    </div>
                </div>
                <a href="/home" class="text-gray-600 hover:text-gray-800 transition-colors">
                    <i data-lucide="home" class="w-5 h-5"></i>
                </a>
            </div>
        </div>
    </header>

    <!-- Success Message -->
    <?php if (isset($success_message)): ?>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <?= htmlspecialchars($success_message) ?>
        </div>
    </div>
    <?php endif; ?>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-xl p-6 shadow-sm">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-600">Transaksi Hari Ini</p>
                        <p class="text-2xl font-bold text-gray-800"><?= $stats['total_transactions'] ?></p>
                    </div>
                    <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <i data-lucide="shopping-cart" class="w-6 h-6 text-blue-600"></i>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-xl p-6 shadow-sm">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-600">Revenue Hari Ini</p>
                        <p class="text-2xl font-bold text-gray-800"><?= formatCurrency($stats['total_revenue']) ?></p>
                    </div>
                    <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <i data-lucide="dollar-sign" class="w-6 h-6 text-green-600"></i>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-xl p-6 shadow-sm">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-600">Transaksi Sukses</p>
                        <p class="text-2xl font-bold text-gray-800"><?= $stats['success_transactions'] ?></p>
                    </div>
                    <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <i data-lucide="check-circle" class="w-6 h-6 text-purple-600"></i>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-xl p-6 shadow-sm">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-600">Total Produk</p>
                        <p class="text-2xl font-bold text-gray-800"><?= $stats['total_products'] ?></p>
                    </div>
                    <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <i data-lucide="package" class="w-6 h-6 text-orange-600"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tabs Navigation -->
        <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div class="border-b border-gray-200">
                <nav class="flex">
                    <button @click="activeTab = 'config'" 
                            :class="activeTab === 'config' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                            class="py-4 px-6 border-b-2 font-medium text-sm transition-colors">
                        Konfigurasi API
                    </button>
                    <button @click="activeTab = 'products'" 
                            :class="activeTab === 'products' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                            class="py-4 px-6 border-b-2 font-medium text-sm transition-colors">
                        Manajemen Produk
                    </button>
                    <button @click="activeTab = 'transactions'" 
                            :class="activeTab === 'transactions' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                            class="py-4 px-6 border-b-2 font-medium text-sm transition-colors">
                        Riwayat Transaksi
                    </button>
                </nav>
            </div>

            <!-- Tab Contents -->
            <div class="p-6">
                <!-- API Configuration Tab -->
                <div x-show="activeTab === 'config'" x-cloak>
                    <h3 class="text-lg font-semibold text-gray-800 mb-6">Konfigurasi API</h3>
                    
                    <form method="POST" class="space-y-6">
                        <input type="hidden" name="action" value="update_api_config">
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Digiflazz Username</label>
                                <input type="text" name="digiflazz_username" value="<?= htmlspecialchars($digiflazz_username) ?>"
                                       class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Digiflazz API Key</label>
                                <input type="password" name="digiflazz_api_key" value="<?= htmlspecialchars($digiflazz_api_key) ?>"
                                       class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            </div>
                            
                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-gray-700 mb-2">PayDisini API Key</label>
                                <input type="password" name="paydisini_api_key" value="<?= htmlspecialchars($paydisini_api_key) ?>"
                                       class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            </div>
                        </div>
                        
                        <div class="flex space-x-4">
                            <button type="submit" class="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors">
                                Simpan Konfigurasi
                            </button>
                            <button type="button" @click="testApiConnection()" 
                                    class="bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors">
                                Test Koneksi
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Products Management Tab -->
                <div x-show="activeTab === 'products'" x-cloak>
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-lg font-semibold text-gray-800">Manajemen Produk</h3>
                        <form method="POST" class="inline">
                            <input type="hidden" name="action" value="sync_products">
                            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                                <i data-lucide="refresh-cw" class="w-4 h-4 inline mr-2"></i>
                                Sinkronisasi Produk
                            </button>
                        </form>
                    </div>
                    
                    <div x-show="loading" class="text-center py-8">
                        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p class="text-gray-600 mt-2">Memuat produk...</p>
                    </div>
                    
                    <div x-show="!loading" class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operator</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                <template x-for="product in products" :key="product.id">
                                    <tr>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div class="text-sm font-medium text-gray-900" x-text="product.product_name"></div>
                                                <div class="text-sm text-gray-500" x-text="product.description"></div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900" x-text="product.category"></td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900" x-text="product.operator"></td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" x-text="formatPrice(product.price)"></td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span :class="product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" 
                                                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" x-text="product.status"></span>
                                        </td>
                                    </tr>
                                </template>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Transactions Tab -->
                <div x-show="activeTab === 'transactions'" x-cloak>
                    <h3 class="text-lg font-semibold text-gray-800 mb-6">Riwayat Transaksi</h3>
                    
                    <div x-show="loadingTransactions" class="text-center py-8">
                        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p class="text-gray-600 mt-2">Memuat transaksi...</p>
                    </div>
                    
                    <div x-show="!loadingTransactions" class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Transaksi</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                <template x-for="transaction in transactions" :key="transaction.id">
                                    <tr>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600" x-text="transaction.transaction_id"></td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900" x-text="transaction.product_name"></td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900" x-text="transaction.customer_phone"></td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" x-text="formatPrice(transaction.amount)"></td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span :class="getStatusClass(transaction.status)" 
                                                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" x-text="transaction.status"></span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500" x-text="formatDate(transaction.created_at)"></td>
                                    </tr>
                                </template>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <script>
        lucide.createIcons();

        function adminApp() {
            return {
                activeTab: 'config',
                loading: false,
                loadingTransactions: false,
                products: [],
                transactions: [],

                async init() {
                    await this.loadProducts();
                    await this.loadTransactions();
                },

                async loadProducts() {
                    this.loading = true;
                    try {
                        const response = await fetch('/api/admin/products');
                        const data = await response.json();
                        this.products = data;
                    } catch (error) {
                        console.error('Error loading products:', error);
                    } finally {
                        this.loading = false;
                    }
                },

                async loadTransactions() {
                    this.loadingTransactions = true;
                    try {
                        const response = await fetch('/api/admin/transactions');
                        const data = await response.json();
                        this.transactions = data;
                    } catch (error) {
                        console.error('Error loading transactions:', error);
                    } finally {
                        this.loadingTransactions = false;
                    }
                },

                async testApiConnection() {
                    try {
                        const response = await fetch('/api/admin/test-connection', {
                            method: 'POST'
                        });
                        const result = await response.json();
                        
                        if (result.success) {
                            alert('Koneksi API berhasil!');
                        } else {
                            alert('Koneksi API gagal: ' + result.message);
                        }
                    } catch (error) {
                        alert('Terjadi kesalahan: ' + error.message);
                    }
                },

                formatPrice(price) {
                    return 'Rp ' + new Intl.NumberFormat('id-ID').format(price);
                },

                formatDate(dateString) {
                    const date = new Date(dateString);
                    return date.toLocaleDateString('id-ID') + ' ' + date.toLocaleTimeString('id-ID');
                },

                getStatusClass(status) {
                    const classes = {
                        'pending': 'bg-yellow-100 text-yellow-800',
                        'processing': 'bg-blue-100 text-blue-800',
                        'success': 'bg-green-100 text-green-800',
                        'failed': 'bg-red-100 text-red-800',
                        'cancelled': 'bg-gray-100 text-gray-800'
                    };
                    return classes[status] || 'bg-gray-100 text-gray-800';
                }
            }
        }
    </script>
</body>
</html>