<?php
require_once 'config/app.php';
require_once 'includes/functions.php';

// Ambil kategori produk
$categories = getProductCategories();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= APP_NAME ?> - Beranda</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
    <style>
        [x-cloak] { display: none !important; }
    </style>
</head>
<body class="bg-gray-50 min-h-screen" x-data="app()" x-init="init()">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                        <i data-lucide="zap" class="w-5 h-5 text-white"></i>
                    </div>
                    <div>
                        <h1 class="text-lg font-bold text-gray-800"><?= APP_NAME ?></h1>
                        <p class="text-xs text-green-600 font-medium">Transaksi Instan Tanpa Akun</p>
                    </div>
                </div>
                <a href="/admin" class="text-gray-600 hover:text-gray-800 transition-colors">
                    <i data-lucide="settings" class="w-5 h-5"></i>
                </a>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <!-- Welcome Section -->
        <div class="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-6 text-white mb-6">
            <h2 class="text-2xl font-bold mb-2">Selamat Datang!</h2>
            <p class="text-blue-100">Pilih kategori produk dan lakukan transaksi dengan mudah</p>
        </div>

        <!-- Categories Grid -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <div x-show="categories.pulsa > 0" class="category-card bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border-2 hover:border-blue-200" 
                 @click="selectCategory('pulsa')">
                <div class="text-center">
                    <div class="w-12 h-12 mx-auto bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                        <i data-lucide="smartphone" class="w-6 h-6 text-blue-600"></i>
                    </div>
                    <h3 class="font-semibold text-gray-800 mb-1">Pulsa</h3>
                    <p class="text-xs text-gray-600" x-text="categories.pulsa + ' produk'"></p>
                </div>
            </div>

            <div x-show="categories.data > 0" class="category-card bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border-2 hover:border-green-200" 
                 @click="selectCategory('data')">
                <div class="text-center">
                    <div class="w-12 h-12 mx-auto bg-green-100 rounded-xl flex items-center justify-center mb-3">
                        <i data-lucide="wifi" class="w-6 h-6 text-green-600"></i>
                    </div>
                    <h3 class="font-semibold text-gray-800 mb-1">Paket Data</h3>
                    <p class="text-xs text-gray-600" x-text="categories.data + ' produk'"></p>
                </div>
            </div>

            <div x-show="categories.pln > 0" class="category-card bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border-2 hover:border-yellow-200" 
                 @click="selectCategory('pln')">
                <div class="text-center">
                    <div class="w-12 h-12 mx-auto bg-yellow-100 rounded-xl flex items-center justify-center mb-3">
                        <i data-lucide="zap" class="w-6 h-6 text-yellow-600"></i>
                    </div>
                    <h3 class="font-semibold text-gray-800 mb-1">Token PLN</h3>
                    <p class="text-xs text-gray-600" x-text="categories.pln + ' produk'"></p>
                </div>
            </div>

            <div x-show="categories.game > 0" class="category-card bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border-2 hover:border-purple-200" 
                 @click="selectCategory('game')">
                <div class="text-center">
                    <div class="w-12 h-12 mx-auto bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                        <i data-lucide="gamepad-2" class="w-6 h-6 text-purple-600"></i>
                    </div>
                    <h3 class="font-semibold text-gray-800 mb-1">Voucher Game</h3>
                    <p class="text-xs text-gray-600" x-text="categories.game + ' produk'"></p>
                </div>
            </div>

            <div x-show="categories.ewallet > 0" class="category-card bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border-2 hover:border-indigo-200" 
                 @click="selectCategory('ewallet')">
                <div class="text-center">
                    <div class="w-12 h-12 mx-auto bg-indigo-100 rounded-xl flex items-center justify-center mb-3">
                        <i data-lucide="wallet" class="w-6 h-6 text-indigo-600"></i>
                    </div>
                    <h3 class="font-semibold text-gray-800 mb-1">E-Wallet</h3>
                    <p class="text-xs text-gray-600" x-text="categories.ewallet + ' produk'"></p>
                </div>
            </div>
        </div>

        <!-- Selected Category Products -->
        <div x-show="selectedCategory" x-cloak class="bg-white rounded-2xl shadow-sm p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-800" x-text="getCategoryTitle(selectedCategory)"></h3>
                <button @click="selectedCategory = null" class="text-gray-500 hover:text-gray-700">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>

            <!-- Phone Number Input (for pulsa/data) -->
            <div x-show="['pulsa', 'data'].includes(selectedCategory)" class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Nomor HP</label>
                <input type="tel" x-model="phoneNumber" @input="detectOperator()" 
                       placeholder="Masukkan nomor HP" 
                       class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <p x-show="detectedOperator" x-text="'Operator terdeteksi: ' + detectedOperator" 
                   class="text-sm text-blue-600 mt-1"></p>
            </div>

            <!-- PLN Customer ID Input -->
            <div x-show="selectedCategory === 'pln'" class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">ID Pelanggan PLN</label>
                <input type="text" x-model="plnCustomerId" 
                       placeholder="Masukkan ID Pelanggan PLN" 
                       class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
            </div>

            <!-- Game User ID Input -->
            <div x-show="selectedCategory === 'game'" class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">User ID Game</label>
                <input type="text" x-model="gameUserId" 
                       placeholder="Masukkan User ID" 
                       class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
            </div>

            <!-- E-wallet Phone Input -->
            <div x-show="selectedCategory === 'ewallet'" class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Nomor HP E-Wallet</label>
                <input type="tel" x-model="ewalletPhone" 
                       placeholder="Nomor HP terdaftar di e-wallet" 
                       class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
            </div>

            <!-- Products List -->
            <div x-show="loading" class="text-center py-8">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p class="text-gray-600 mt-2">Memuat produk...</p>
            </div>

            <div x-show="!loading && products.length === 0" class="text-center py-8">
                <i data-lucide="package" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                <p class="text-gray-600">Belum ada produk untuk kategori ini</p>
            </div>

            <div x-show="!loading && products.length > 0" class="grid gap-3">
                <template x-for="product in products" :key="product.id">
                    <div class="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors cursor-pointer"
                         @click="selectProduct(product)">
                        <div class="flex justify-between items-center">
                            <div class="flex-1">
                                <h4 class="font-semibold text-gray-800" x-text="product.product_name"></h4>
                                <p class="text-sm text-gray-600" x-text="product.description"></p>
                                <p class="text-sm text-gray-500 mt-1" x-text="'Operator: ' + product.operator"></p>
                            </div>
                            <div class="text-right">
                                <p class="text-lg font-bold text-blue-600" x-text="formatPrice(product.price)"></p>
                                <button class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                                    Pilih
                                </button>
                            </div>
                        </div>
                    </div>
                </template>
            </div>
        </div>
    </main>

    <!-- Transaction Modal -->
    <div x-show="showTransactionModal" x-cloak class="fixed inset-0 z-50 overflow-y-auto" 
         @click.away="showTransactionModal = false">
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"></div>
            
            <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Konfirmasi Transaksi</h3>
                    
                    <div x-show="selectedProduct" class="space-y-4">
                        <div class="bg-gray-50 rounded-lg p-4">
                            <h4 class="font-semibold" x-text="selectedProduct?.product_name"></h4>
                            <p class="text-sm text-gray-600" x-text="selectedProduct?.description"></p>
                            <p class="text-lg font-bold text-blue-600 mt-2" x-text="formatPrice(selectedProduct?.price)"></p>
                        </div>
                        
                        <div class="space-y-2">
                            <div x-show="['pulsa', 'data'].includes(selectedCategory)">
                                <span class="text-sm text-gray-600">Nomor HP: </span>
                                <span class="font-medium" x-text="phoneNumber"></span>
                            </div>
                            <div x-show="selectedCategory === 'pln'">
                                <span class="text-sm text-gray-600">ID Pelanggan: </span>
                                <span class="font-medium" x-text="plnCustomerId"></span>
                            </div>
                            <div x-show="selectedCategory === 'game'">
                                <span class="text-sm text-gray-600">User ID: </span>
                                <span class="font-medium" x-text="gameUserId"></span>
                            </div>
                            <div x-show="selectedCategory === 'ewallet'">
                                <span class="text-sm text-gray-600">Nomor E-Wallet: </span>
                                <span class="font-medium" x-text="ewalletPhone"></span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button @click="processTransaction()" 
                            :disabled="processingTransaction"
                            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                        <span x-show="!processingTransaction">Bayar Sekarang</span>
                        <span x-show="processingTransaction">Memproses...</span>
                    </button>
                    <button @click="showTransactionModal = false" 
                            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                        Batal
                    </button>
                </div>
            </div>
        </div>
    </div>

    <script>
        lucide.createIcons();

        function app() {
            return {
                categories: { pulsa: 0, data: 0, pln: 0, game: 0, ewallet: 0 },
                selectedCategory: null,
                products: [],
                loading: false,
                phoneNumber: '',
                plnCustomerId: '',
                gameUserId: '',
                ewalletPhone: '',
                detectedOperator: '',
                selectedProduct: null,
                showTransactionModal: false,
                processingTransaction: false,

                async init() {
                    await this.loadCategories();
                },

                async loadCategories() {
                    try {
                        const response = await fetch('/api/categories');
                        const data = await response.json();
                        this.categories = data;
                    } catch (error) {
                        console.error('Error loading categories:', error);
                    }
                },

                async selectCategory(category) {
                    this.selectedCategory = category;
                    this.products = [];
                    this.loading = true;
                    
                    try {
                        const response = await fetch(`/api/products?category=${category}`);
                        const data = await response.json();
                        this.products = data;
                    } catch (error) {
                        console.error('Error loading products:', error);
                    } finally {
                        this.loading = false;
                    }
                },

                detectOperator() {
                    const phone = this.phoneNumber.replace(/\D/g, '');
                    if (phone.startsWith('0811') || phone.startsWith('0812') || phone.startsWith('0813') || phone.startsWith('0821') || phone.startsWith('0822') || phone.startsWith('0823')) {
                        this.detectedOperator = 'Telkomsel';
                    } else if (phone.startsWith('0817') || phone.startsWith('0818') || phone.startsWith('0819') || phone.startsWith('0859') || phone.startsWith('0877') || phone.startsWith('0878')) {
                        this.detectedOperator = 'XL';
                    } else if (phone.startsWith('0814') || phone.startsWith('0815') || phone.startsWith('0816') || phone.startsWith('0855') || phone.startsWith('0856') || phone.startsWith('0857') || phone.startsWith('0858')) {
                        this.detectedOperator = 'Indosat';
                    } else if (phone.startsWith('0832') || phone.startsWith('0833') || phone.startsWith('0838')) {
                        this.detectedOperator = 'Axis';
                    } else {
                        this.detectedOperator = '';
                    }
                },

                selectProduct(product) {
                    this.selectedProduct = product;
                    this.showTransactionModal = true;
                },

                async processTransaction() {
                    if (this.processingTransaction) return;
                    
                    this.processingTransaction = true;
                    
                    try {
                        const transactionData = {
                            product_id: this.selectedProduct.id,
                            customer_data: this.getCustomerData(),
                            amount: this.selectedProduct.price
                        };

                        const response = await fetch('/api/transaction', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(transactionData)
                        });
                        
                        const result = await response.json();
                        
                        if (result.success) {
                            alert('Transaksi berhasil dibuat! Silakan lakukan pembayaran.');
                            if (result.payment_url) {
                                window.open(result.payment_url, '_blank');
                            }
                        } else {
                            alert('Gagal membuat transaksi: ' + result.message);
                        }
                    } catch (error) {
                        alert('Terjadi kesalahan: ' + error.message);
                    } finally {
                        this.processingTransaction = false;
                        this.showTransactionModal = false;
                    }
                },

                getCustomerData() {
                    switch (this.selectedCategory) {
                        case 'pulsa':
                        case 'data':
                            return this.phoneNumber;
                        case 'pln':
                            return this.plnCustomerId;
                        case 'game':
                            return this.gameUserId;
                        case 'ewallet':
                            return this.ewalletPhone;
                        default:
                            return '';
                    }
                },

                getCategoryTitle(category) {
                    const titles = {
                        pulsa: 'Pulsa',
                        data: 'Paket Data',
                        pln: 'Token PLN',
                        game: 'Voucher Game',
                        ewallet: 'Top Up E-Wallet'
                    };
                    return titles[category] || category;
                },

                formatPrice(price) {
                    return 'Rp ' + new Intl.NumberFormat('id-ID').format(price);
                }
            }
        }
    </script>
</body>
</html>