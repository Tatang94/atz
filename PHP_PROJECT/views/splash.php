<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= APP_NAME ?> - Platform Pulsa & Pembayaran</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/lucide/0.453.0/lucide.min.css" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .fade-in-up {
            animation: fadeInUp 0.6s ease-out forwards;
        }
        .animate-pulse-slow {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
    </style>
</head>
<body class="bg-gradient-to-br from-blue-50 via-white to-green-50 min-h-screen">
    <div id="splashScreen" class="min-h-screen flex items-center justify-center px-4">
        <div class="text-center max-w-md mx-auto">
            <!-- Logo -->
            <div class="fade-in-up mb-8">
                <div class="w-24 h-24 mx-auto bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                    <i data-lucide="zap" class="w-12 h-12 text-white"></i>
                </div>
                <h1 class="text-3xl font-bold text-gray-800 mb-2"><?= APP_NAME ?></h1>
                <p class="text-gray-600">Platform Pulsa & Pembayaran Digital</p>
            </div>

            <!-- Features -->
            <div class="fade-in-up space-y-4 mb-8" style="animation-delay: 0.2s;">
                <div class="flex items-center justify-center space-x-3 text-gray-700">
                    <i data-lucide="smartphone" class="w-5 h-5 text-blue-600"></i>
                    <span>Pulsa & Paket Data</span>
                </div>
                <div class="flex items-center justify-center space-x-3 text-gray-700">
                    <i data-lucide="zap" class="w-5 h-5 text-yellow-600"></i>
                    <span>Token Listrik PLN</span>
                </div>
                <div class="flex items-center justify-center space-x-3 text-gray-700">
                    <i data-lucide="gamepad-2" class="w-5 h-5 text-purple-600"></i>
                    <span>Voucher Game</span>
                </div>
                <div class="flex items-center justify-center space-x-3 text-gray-700">
                    <i data-lucide="wallet" class="w-5 h-5 text-green-600"></i>
                    <span>Top Up E-Wallet</span>
                </div>
            </div>

            <!-- Keunggulan -->
            <div class="fade-in-up bg-white rounded-xl p-6 shadow-lg mb-8" style="animation-delay: 0.4s;">
                <h3 class="font-semibold text-gray-800 mb-4">Kenapa Pilih Kami?</h3>
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div class="flex items-center space-x-2">
                        <i data-lucide="check-circle" class="w-4 h-4 text-green-600"></i>
                        <span>Tanpa Registrasi</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <i data-lucide="zap" class="w-4 h-4 text-blue-600"></i>
                        <span>Proses Cepat</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <i data-lucide="shield-check" class="w-4 h-4 text-purple-600"></i>
                        <span>Aman & Terpercaya</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <i data-lucide="clock" class="w-4 h-4 text-orange-600"></i>
                        <span>24/7 Online</span>
                    </div>
                </div>
            </div>

            <!-- Loading Progress -->
            <div class="fade-in-up" style="animation-delay: 0.6s;">
                <div class="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div id="progressBar" class="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full transition-all duration-300 ease-out" style="width: 0%"></div>
                </div>
                <p id="loadingText" class="text-sm text-gray-600">Mempersiapkan aplikasi...</p>
            </div>

            <!-- Enter Button (Hidden initially) -->
            <button id="enterButton" onclick="enterApp()" class="hidden w-full bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                <span class="flex items-center justify-center space-x-2">
                    <span>Mulai Belanja</span>
                    <i data-lucide="arrow-right" class="w-5 h-5"></i>
                </span>
            </button>
        </div>
    </div>

    <script>
        // Initialize Lucide icons
        lucide.createIcons();

        // Loading simulation
        let progress = 0;
        const progressBar = document.getElementById('progressBar');
        const loadingText = document.getElementById('loadingText');
        const enterButton = document.getElementById('enterButton');
        
        const loadingSteps = [
            { progress: 20, text: "Memuat produk..." },
            { progress: 40, text: "Menghubungkan ke server..." },
            { progress: 60, text: "Menyiapkan pembayaran..." },
            { progress: 80, text: "Mengecek ketersediaan..." },
            { progress: 100, text: "Siap digunakan!" }
        ];

        let currentStep = 0;

        function updateProgress() {
            if (currentStep < loadingSteps.length) {
                const step = loadingSteps[currentStep];
                progressBar.style.width = step.progress + '%';
                loadingText.textContent = step.text;
                currentStep++;
                
                if (currentStep === loadingSteps.length) {
                    setTimeout(() => {
                        loadingText.textContent = "✨ Aplikasi siap digunakan!";
                        enterButton.classList.remove('hidden');
                        enterButton.classList.add('fade-in-up');
                    }, 500);
                } else {
                    setTimeout(updateProgress, 800);
                }
            }
        }

        function enterApp() {
            document.getElementById('splashScreen').style.opacity = '0';
            document.getElementById('splashScreen').style.transform = 'scale(0.95)';
            document.getElementById('splashScreen').style.transition = 'all 0.3s ease-out';
            
            setTimeout(() => {
                window.location.href = '/home';
            }, 300);
        }

        // Start loading animation after 1 second
        setTimeout(() => {
            updateProgress();
        }, 1000);

        // Auto enter after 8 seconds if user doesn't click
        setTimeout(() => {
            if (!enterButton.classList.contains('hidden')) {
                enterApp();
            }
        }, 8000);
    </script>
</body>
</html>