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
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
            <!-- Pulsa -->
            <div x-show="categories.pulsa > 0" class="category-card bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-200 transform hover:scale-105" 
                 @click="selectCategory('pulsa')">
                <div class="text-center">
                    <div class="w-14 h-14 mx-auto bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-3">
                        <i data-lucide="smartphone" class="w-7 h-7 text-blue-600"></i>
                    </div>
                    <h3 class="font-semibold text-gray-800 mb-1">Pulsa</h3>
                    <p class="text-xs text-gray-600" x-text="categories.pulsa + ' produk'"></p>
                </div>
            </div>

            <!-- Data -->
            <div x-show="categories.data > 0" class="category-card bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all cursor-pointer border-2 hover:border-green-200 transform hover:scale-105" 
                 @click="selectCategory('data')">
                <div class="text-center">
                    <div class="w-14 h-14 mx-auto bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mb-3">
                        <i data-lucide="wifi" class="w-7 h-7 text-green-600"></i>
                    </div>
                    <h3 class="font-semibold text-gray-800 mb-1">Data</h3>
                    <p class="text-xs text-gray-600" x-text="categories.data + ' produk'"></p>
                </div>
            </div>

            <!-- Games -->
            <div x-show="categories.games > 0" class="category-card bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all cursor-pointer border-2 hover:border-purple-200 transform hover:scale-105" 
                 @click="selectCategory('games')">
                <div class="text-center">
                    <div class="w-14 h-14 mx-auto bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mb-3">
                        <i data-lucide="gamepad-2" class="w-7 h-7 text-purple-600"></i>
                    </div>
                    <h3 class="font-semibold text-gray-800 mb-1">Games</h3>
                    <p class="text-xs text-gray-600" x-text="categories.games + ' produk'"></p>
                </div>
            </div>

            <!-- Voucher -->
            <div x-show="categories.voucher > 0" class="category-card bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all cursor-pointer border-2 hover:border-orange-200 transform hover:scale-105" 
                 @click="selectCategory('voucher')">
                <div class="text-center">
                    <div class="w-14 h-14 mx-auto bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center mb-3">
                        <i data-lucide="gift" class="w-7 h-7 text-orange-600"></i>
                    </div>
                    <h3 class="font-semibold text-gray-800 mb-1">Voucher</h3>
                    <p class="text-xs text-gray-600" x-text="categories.voucher + ' produk'"></p>
                </div>
            </div>

            <!-- E-Money -->
            <div x-show="categories.emoney > 0" class="category-card bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all cursor-pointer border-2 hover:border-indigo-200 transform hover:scale-105" 
                 @click="selectCategory('emoney')">
                <div class="text-center">
                    <div class="w-14 h-14 mx-auto bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center mb-3">
                        <i data-lucide="wallet" class="w-7 h-7 text-indigo-600"></i>
                    </div>
                    <h3 class="font-semibold text-gray-800 mb-1">E-Money</h3>
                    <p class="text-xs text-gray-600" x-text="categories.emoney + ' produk'"></p>
                </div>
            </div>

            <!-- PLN -->
            <div x-show="categories.pln > 0" class="category-card bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all cursor-pointer border-2 hover:border-yellow-200 transform hover:scale-105" 
                 @click="selectCategory('pln')">
                <div class="text-center">
                    <div class="w-14 h-14 mx-auto bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center mb-3">
                        <i data-lucide="zap" class="w-7 h-7 text-yellow-600"></i>
                    </div>
                    <h3 class="font-semibold text-gray-800 mb-1">PLN</h3>
                    <p class="text-xs text-gray-600" x-text="categories.pln + ' produk'"></p>
                </div>
            </div>

            <!-- China Topup -->
            <div x-show="categories.china_topup > 0" class="category-card bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all cursor-pointer border-2 hover:border-red-200 transform hover:scale-105" 
                 @click="selectCategory('china_topup')">
                <div class="text-center">
                    <div class="w-14 h-14 mx-auto bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center mb-3">
                        <i data-lucide="flag" class="w-7 h-7 text-red-600"></i>
                    </div>
                    <h3 class="font-semibold text-gray-800 mb-1 text-xs">China Topup</h3>
                    <p class="text-xs text-gray-600" x-text="categories.china_topup + ' produk'"></p>
                </div>
            </div>

            <!-- Malaysia Topup -->
            <div x-show="categories.malaysia_topup > 0" class="category-card bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all cursor-pointer border-2 hover:border-teal-200 transform hover:scale-105" 
                 @click="selectCategory('malaysia_topup')">
                <div class="text-center">
                    <div class="w-14 h-14 mx-auto bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl flex items-center justify-center mb-3">
                        <i data-lucide="map-pin" class="w-7 h-7 text-teal-600"></i>
                    </div>
                    <h3 class="font-semibold text-gray-800 mb-1 text-xs">Malaysia Topup</h3>
                    <p class="text-xs text-gray-600" x-text="categories.malaysia_topup + ' produk'"></p>
                </div>
            </div>

            <!-- Philippines Topup -->
            <div x-show="categories.philippines_topup > 0" class="category-card bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all cursor-pointer border-2 hover:border-cyan-200 transform hover:scale-105" 
                 @click="selectCategory('philippines_topup')">
                <div class="text-center">
                    <div class="w-14 h-14 mx-auto bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-xl flex items-center justify-center mb-3">
                        <i data-lucide="globe" class="w-7 h-7 text-cyan-600"></i>
                    </div>
                    <h3 class="font-semibold text-gray-800 mb-1 text-xs">Philippines Topup</h3>
                    <p class="text-xs text-gray-600" x-text="categories.philippines_topup + ' produk'"></p>
                </div>
            </div>

            <!-- Singapore Topup -->
            <div x-show="categories.singapore_topup > 0" class="category-card bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all cursor-pointer border-2 hover:border-pink-200 transform hover:scale-105" 
                 @click="selectCategory('singapore_topup')">
                <div class="text-center">
                    <div class="w-14 h-14 mx-auto bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center mb-3">
                        <i data-lucide="building" class="w-7 h-7 text-pink-600"></i>
                    </div>
                    <h3 class="font-semibold text-gray-800 mb-1 text-xs">Singapore Topup</h3>
                    <p class="text-xs text-gray-600" x-text="categories.singapore_topup + ' produk'"></p>
                </div>
            </div>

            <!-- Thailand Topup -->
            <div x-show="categories.thailand_topup > 0" class="category-card bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all cursor-pointer border-2 hover:border-rose-200 transform hover:scale-105" 
                 @click="selectCategory('thailand_topup')">
                <div class="text-center">
                    <div class="w-14 h-14 mx-auto bg-gradient-to-br from-rose-100 to-rose-200 rounded-xl flex items-center justify-center mb-3">
                        <i data-lucide="palmtree" class="w-7 h-7 text-rose-600"></i>
                    </div>
                    <h3 class="font-semibold text-gray-800 mb-1 text-xs">Thailand Topup</h3>
                    <p class="text-xs text-gray-600" x-text="categories.thailand_topup + ' produk'"></p>
                </div>
            </div>

            <!-- SMS & Telpon -->
            <div x-show="categories.sms_telpon > 0" class="category-card bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all cursor-pointer border-2 hover:border-amber-200 transform hover:scale-105" 
                 @click="selectCategory('sms_telpon')">
                <div class="text-center">
                    <div class="w-14 h-14 mx-auto bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center mb-3">
                        <i data-lucide="message-circle" class="w-7 h-7 text-amber-600"></i>
                    </div>
                    <h3 class="font-semibold text-gray-800 mb-1 text-xs">SMS & Telpon</h3>
                    <p class="text-xs text-gray-600" x-text="categories.sms_telpon + ' produk'"></p>
                </div>
            </div>

            <!-- Vietnam Topup -->
            <div x-show="categories.vietnam_topup > 0" class="category-card bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all cursor-pointer border-2 hover:border-emerald-200 transform hover:scale-105" 
                 @click="selectCategory('vietnam_topup')">
                <div class="text-center">
                    <div class="w-14 h-14 mx-auto bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center mb-3">
                        <i data-lucide="mountain" class="w-7 h-7 text-emerald-600"></i>
                    </div>
                    <h3 class="font-semibold text-gray-800 mb-1 text-xs">Vietnam Topup</h3>
                    <p class="text-xs text-gray-600" x-text="categories.vietnam_topup + ' produk'"></p>
                </div>
            </div>

            <!-- Streaming TV -->
            <div x-show="categories.streaming_tv > 0" class="category-card bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all cursor-pointer border-2 hover:border-violet-200 transform hover:scale-105" 
                 @click="selectCategory('streaming_tv')">
                <div class="text-center">
                    <div class="w-14 h-14 mx-auto bg-gradient-to-br from-violet-100 to-violet-200 rounded-xl flex items-center justify-center mb-3">
                        <i data-lucide="tv" class="w-7 h-7 text-violet-600"></i>
                    </div>
                    <h3 class="font-semibold text-gray-800 mb-1 text-xs">Streaming TV</h3>
                    <p class="text-xs text-gray-600" x-text="categories.streaming_tv + ' produk'"></p>
                </div>
            </div>

            <!-- Aktivasi Voucher -->
            <div x-show="categories.aktivasi_voucher > 0" class="category-card bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all cursor-pointer border-2 hover:border-lime-200 transform hover:scale-105" 
                 @click="selectCategory('aktivasi_voucher')">
                <div class="text-center">
                    <div class="w-14 h-14 mx-auto bg-gradient-to-br from-lime-100 to-lime-200 rounded-xl flex items-center justify-center mb-3">
                        <i data-lucide="ticket" class="w-7 h-7 text-lime-600"></i>
                    </div>
                    <h3 class="font-semibold text-gray-800 mb-1 text-xs">Aktivasi Voucher</h3>
                    <p class="text-xs text-gray-600" x-text="categories.aktivasi_voucher + ' produk'"></p>
                </div>
            </div>

            <!-- Masa Aktif -->
            <div x-show="categories.masa_aktif > 0" class="category-card bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all cursor-pointer border-2 hover:border-sky-200 transform hover:scale-105" 
                 @click="selectCategory('masa_aktif')">
                <div class="text-center">
                    <div class="w-14 h-14 mx-auto bg-gradient-to-br from-sky-100 to-sky-200 rounded-xl flex items-center justify-center mb-3">
                        <i data-lucide="clock" class="w-7 h-7 text-sky-600"></i>
                    </div>
                    <h3 class="font-semibold text-gray-800 mb-1 text-xs">Masa Aktif</h3>
                    <p class="text-xs text-gray-600" x-text="categories.masa_aktif + ' produk'"></p>
                </div>
            </div>

            <!-- Bundling -->
            <div x-show="categories.bundling > 0" class="category-card bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all cursor-pointer border-2 hover:border-stone-200 transform hover:scale-105" 
                 @click="selectCategory('bundling')">
                <div class="text-center">
                    <div class="w-14 h-14 mx-auto bg-gradient-to-br from-stone-100 to-stone-200 rounded-xl flex items-center justify-center mb-3">
                        <i data-lucide="package-2" class="w-7 h-7 text-stone-600"></i>
                    </div>
                    <h3 class="font-semibold text-gray-800 mb-1 text-xs">Bundling</h3>
                    <p class="text-xs text-gray-600" x-text="categories.bundling + ' produk'"></p>
                </div>
            </div>

            <!-- Aktivasi Perdana -->
            <div x-show="categories.aktivasi_perdana > 0" class="category-card bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all cursor-pointer border-2 hover:border-neutral-200 transform hover:scale-105" 
                 @click="selectCategory('aktivasi_perdana')">
                <div class="text-center">
                    <div class="w-14 h-14 mx-auto bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-xl flex items-center justify-center mb-3">
                        <i data-lucide="sim-card" class="w-7 h-7 text-neutral-600"></i>
                    </div>
                    <h3 class="font-semibold text-gray-800 mb-1 text-xs">Aktivasi Perdana</h3>
                    <p class="text-xs text-gray-600" x-text="categories.aktivasi_perdana + ' produk'"></p>
                </div>
            </div>

            <!-- Gas -->
            <div x-show="categories.gas > 0" class="category-card bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all cursor-pointer border-2 hover:border-gray-200 transform hover:scale-105" 
                 @click="selectCategory('gas')">
                <div class="text-center">
                    <div class="w-14 h-14 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mb-3">
                        <i data-lucide="flame" class="w-7 h-7 text-gray-600"></i>
                    </div>
                    <h3 class="font-semibold text-gray-800 mb-1 text-xs">Gas</h3>
                    <p class="text-xs text-gray-600" x-text="categories.gas + ' produk'"></p>
                </div>
            </div>

            <!-- eSIM -->
            <div x-show="categories.esim > 0" class="category-card bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-200 transform hover:scale-105" 
                 @click="selectCategory('esim')">
                <div class="text-center">
                    <div class="w-14 h-14 mx-auto bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-3">
                        <i data-lucide="credit-card" class="w-7 h-7 text-blue-600"></i>
                    </div>
                    <h3 class="font-semibold text-gray-800 mb-1 text-xs">eSIM</h3>
                    <p class="text-xs text-gray-600" x-text="categories.esim + ' produk'"></p>
                </div>
            </div>

            <!-- Media Sosial -->
            <div x-show="categories.media_sosial > 0" class="category-card bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all cursor-pointer border-2 hover:border-fuchsia-200 transform hover:scale-105" 
                 @click="selectCategory('media_sosial')">
                <div class="text-center">
                    <div class="w-14 h-14 mx-auto bg-gradient-to-br from-fuchsia-100 to-fuchsia-200 rounded-xl flex items-center justify-center mb-3">
                        <i data-lucide="share-2" class="w-7 h-7 text-fuchsia-600"></i>
                    </div>
                    <h3 class="font-semibold text-gray-800 mb-1 text-xs">Media Sosial</h3>
                    <p class="text-xs text-gray-600" x-text="categories.media_sosial + ' produk'"></p>
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

            <!-- Customer Input Forms -->
            <!-- Phone Number Input (for phone-based categories) -->
            <div x-show="['pulsa', 'data', 'emoney', 'sms_telpon', 'masa_aktif', 'aktivasi_perdana', 'esim', 'bundling'].includes(selectedCategory)" class="mb-6">
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
                <input type="text" x-model="customerInput" 
                       placeholder="Masukkan ID Pelanggan PLN" 
                       class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
            </div>

            <!-- Games User ID Input -->
            <div x-show="selectedCategory === 'games'" class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">User ID Game</label>
                <input type="text" x-model="customerInput" 
                       placeholder="Masukkan User ID Game" 
                       class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
            </div>

            <!-- Voucher Code Input -->
            <div x-show="selectedCategory === 'voucher'" class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Email/Account</label>
                <input type="email" x-model="customerInput" 
                       placeholder="Email untuk pengiriman voucher" 
                       class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent">
            </div>

            <!-- Gas Customer ID Input -->
            <div x-show="selectedCategory === 'gas'" class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">ID Pelanggan Gas</label>
                <input type="text" x-model="customerInput" 
                       placeholder="Masukkan ID Pelanggan Gas" 
                       class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent">
            </div>

            <!-- International Topup Phone Input -->
            <div x-show="['china_topup', 'malaysia_topup', 'philippines_topup', 'singapore_topup', 'thailand_topup', 'vietnam_topup'].includes(selectedCategory)" class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Nomor HP Internasional</label>
                <input type="tel" x-model="customerInput" 
                       :placeholder="getInternationalPlaceholder(selectedCategory)" 
                       class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent">
            </div>

            <!-- Streaming TV Email Input -->
            <div x-show="selectedCategory === 'streaming_tv'" class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Email Account</label>
                <input type="email" x-model="customerInput" 
                       placeholder="Email untuk akun streaming" 
                       class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent">
            </div>

            <!-- Aktivasi Voucher Phone Input -->
            <div x-show="selectedCategory === 'aktivasi_voucher'" class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Nomor Kartu</label>
                <input type="text" x-model="customerInput" 
                       placeholder="Nomor kartu yang akan diaktivasi" 
                       class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-transparent">
            </div>

            <!-- Media Sosial Account Input -->
            <div x-show="selectedCategory === 'media_sosial'" class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Username/ID Akun</label>
                <input type="text" x-model="customerInput" 
                       placeholder="Username Instagram/TikTok/dll" 
                       class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent">
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
                            <div x-show="['pulsa', 'data', 'emoney', 'sms_telpon', 'masa_aktif', 'aktivasi_perdana', 'esim', 'bundling'].includes(selectedCategory)">
                                <span class="text-sm text-gray-600">Nomor HP: </span>
                                <span class="font-medium" x-text="phoneNumber"></span>
                            </div>
                            <div x-show="!['pulsa', 'data', 'emoney', 'sms_telpon', 'masa_aktif', 'aktivasi_perdana', 'esim', 'bundling'].includes(selectedCategory)">
                                <span class="text-sm text-gray-600" x-text="getCustomerDataLabel(selectedCategory) + ': '"></span>
                                <span class="font-medium" x-text="customerInput"></span>
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
                customerInput: '',
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
                        case 'emoney':
                        case 'sms_telpon':
                        case 'masa_aktif':
                        case 'aktivasi_perdana':
                        case 'esim':
                        case 'bundling':
                            return this.phoneNumber;
                        default:
                            return this.customerInput;
                    }
                },

                getInternationalPlaceholder(category) {
                    const placeholders = {
                        'china_topup': 'Contoh: +8613812345678',
                        'malaysia_topup': 'Contoh: +60123456789',
                        'philippines_topup': 'Contoh: +639171234567',
                        'singapore_topup': 'Contoh: +6591234567',
                        'thailand_topup': 'Contoh: +66812345678',
                        'vietnam_topup': 'Contoh: +84912345678'
                    };
                    return placeholders[category] || 'Masukkan nomor HP';
                },

                getCategoryTitle(category) {
                    const titles = {
                        pulsa: 'Pulsa',
                        data: 'Paket Data',
                        games: 'Games',
                        voucher: 'Voucher',
                        emoney: 'E-Money',
                        pln: 'Token PLN',
                        china_topup: 'China Topup',
                        malaysia_topup: 'Malaysia Topup',
                        philippines_topup: 'Philippines Topup',
                        singapore_topup: 'Singapore Topup',
                        thailand_topup: 'Thailand Topup',
                        sms_telpon: 'SMS & Telpon',
                        vietnam_topup: 'Vietnam Topup',
                        streaming_tv: 'Streaming TV',
                        aktivasi_voucher: 'Aktivasi Voucher',
                        masa_aktif: 'Masa Aktif',
                        bundling: 'Bundling',
                        aktivasi_perdana: 'Aktivasi Perdana',
                        gas: 'Gas',
                        esim: 'eSIM',
                        media_sosial: 'Media Sosial'
                    };
                    return titles[category] || category;
                },

                getCustomerDataLabel(category) {
                    const labels = {
                        pln: 'ID Pelanggan PLN',
                        games: 'User ID Game',
                        voucher: 'Email',
                        gas: 'ID Pelanggan Gas',
                        china_topup: 'Nomor HP China',
                        malaysia_topup: 'Nomor HP Malaysia',
                        philippines_topup: 'Nomor HP Philippines',
                        singapore_topup: 'Nomor HP Singapore',
                        thailand_topup: 'Nomor HP Thailand',
                        vietnam_topup: 'Nomor HP Vietnam',
                        streaming_tv: 'Email Account',
                        aktivasi_voucher: 'Nomor Kartu',
                        media_sosial: 'Username/ID'
                    };
                    return labels[category] || 'Data Pelanggan';
                },

                formatPrice(price) {
                    return 'Rp ' + new Intl.NumberFormat('id-ID').format(price);
                }
            }
        }
    </script>
</body>
</html>