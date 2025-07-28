import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Smartphone, Zap, Gamepad2, CreditCard, Wifi, DollarSign, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function HomeNew() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [targetNumber, setTargetNumber] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch products by category
  const { data: products = [], isLoading: isLoadingProducts, error: productsError } = useQuery({
    queryKey: ['/api/products', selectedCategory],
    queryFn: async () => {
      if (!selectedCategory) return [];
      const response = await apiRequest('GET', `/api/products/${selectedCategory}`, {});
      return response.json();
    },
    enabled: !!selectedCategory,
  });





  // Fetch available categories from products
  const { data: availableCategories = [] } = useQuery({
    queryKey: ['/api/admin/categories'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/categories', {});
      return response.json();
    },
  });

  // Category icons mapping
  const categoryIcons = {
    pulsa: { icon: Smartphone, color: "text-blue-600", description: "Top up pulsa semua operator" },
    data: { icon: Wifi, color: "text-green-600", description: "Paket internet & kuota" },
    pln: { icon: Zap, color: "text-yellow-600", description: "Token listrik prabayar" },
    game: { icon: Gamepad2, color: "text-purple-600", description: "Top up game online" },
    ewallet: { icon: CreditCard, color: "text-pink-600", description: "Isi saldo digital" },
    other: { icon: CreditCard, color: "text-gray-600", description: "Layanan lainnya" },
  };

  // Build categories from available products only
  const categories = availableCategories
    .filter(cat => cat.count > 0) // Only show categories with products
    .map(cat => ({
      id: cat.category,
      name: cat.category.charAt(0).toUpperCase() + cat.category.slice(1),
      count: cat.count,
      ...(categoryIcons[cat.category] || categoryIcons.other)
    }));

  const currentCategory = categories.find(cat => cat.id === selectedCategory);

  // Auto-select first category when categories load
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  // Format currency
  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  // Get operator from phone number
  const getOperator = (phoneNumber: string) => {
    const prefixes = {
      'Telkomsel': ['0811', '0812', '0813', '0821', '0822', '0823', '0851', '0852', '0853'],
      'Indosat': ['0814', '0815', '0816', '0855', '0856', '0857', '0858'],
      'XL': ['0817', '0818', '0819', '0859', '0877', '0878'],
      'Tri': ['0895', '0896', '0897', '0898', '0899'],
      'Axis': ['0831', '0832', '0833', '0838'],
      'Smartfren': ['0881', '0882', '0883', '0884', '0885', '0886', '0887', '0888', '0889'],
    };

    for (const [operator, prefixList] of Object.entries(prefixes)) {
      if (prefixList.some(prefix => phoneNumber.startsWith(prefix))) {
        return operator;
      }
    }
    return 'Unknown';
  };

  const selectedProductData = products.find((p: any) => p.sku === selectedProduct);
  const detectedOperator = targetNumber.length >= 4 ? getOperator(targetNumber) : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Aplikasi Pulsa Indonesia
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Top up pulsa, paket data, token PLN, dan voucher game dengan mudah
          </p>
          

        </div>

        {/* Category Selection */}
        {categories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {categories.map((category) => (
              <Card 
                key={category.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedCategory === category.id 
                    ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <CardContent className="p-4 text-center">
                  <category.icon className={`w-8 h-8 mx-auto mb-2 ${category.color}`} />
                  <h3 className="font-semibold text-sm">{category.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {category.description}
                  </p>
                  <p className="text-xs text-blue-600 font-medium mt-1">
                    {category.count} produk
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 mb-8">
            <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Belum Ada Kategori Tersedia</h3>
            <p className="text-gray-500">
              Admin belum menambahkan produk. Silakan hubungi admin untuk sinkronisasi produk.
            </p>
          </div>
        )}

        {/* Main Content */}
        {categories.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Product Selection */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {currentCategory && <currentCategory.icon className={`w-6 h-6 ${currentCategory.color}`} />}
                    Produk {currentCategory?.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                {isLoadingProducts ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="ml-2">Memuat produk...</span>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">
                      Produk {currentCategory?.name} sedang tidak tersedia.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {products.map((product: any) => (
                      <Card 
                        key={product.sku}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedProduct === product.sku 
                            ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => setSelectedProduct(product.sku)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm mb-1">
                                {product.productName}
                              </h4>
                              <div className="flex gap-2 mb-2">
                                <Badge variant="secondary" className="text-xs">
                                  {product.brand}
                                </Badge>
                                <Badge 
                                  variant={product.isActive ? "default" : "destructive"}
                                  className="text-xs"
                                >
                                  {product.isActive ? "Aktif" : "Nonaktif"}
                                </Badge>
                              </div>
                              {product.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {product.description}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-green-600">
                                {formatCurrency(product.buyerPrice)}
                              </div>
                              <div className="text-xs text-gray-500 line-through">
                                {formatCurrency(product.price)}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Transaction Form */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Form Transaksi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Target Number Input */}
                <div>
                  <Label htmlFor="targetNumber">
                    {selectedCategory === "pln" ? "ID Pelanggan PLN" : "Nomor HP/ID"}
                  </Label>
                  <Input
                    id="targetNumber"
                    type="text"
                    placeholder={
                      selectedCategory === "pln" 
                        ? "Masukkan ID Pelanggan PLN" 
                        : "Masukkan nomor HP"
                    }
                    value={targetNumber}
                    onChange={(e) => setTargetNumber(e.target.value)}
                    className="mt-1"
                  />
                  {detectedOperator && detectedOperator !== 'Unknown' && selectedCategory === "pulsa" && (
                    <p className="text-sm text-green-600 mt-1">
                      Operator terdeteksi: {detectedOperator}
                    </p>
                  )}
                </div>

                {/* Selected Product Info */}
                {selectedProductData && (
                  <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-sm mb-2">Produk Dipilih:</h4>
                      <p className="text-sm mb-1">{selectedProductData.productName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {selectedProductData.brand}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Harga:</span>
                        <span className="font-bold text-green-600">
                          {formatCurrency(selectedProductData.buyerPrice)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Transaction Button */}
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={!selectedProduct || !targetNumber.trim()}
                  onClick={() => {
                    toast({
                      title: "Transaksi Otomatis",
                      description: "Tidak perlu login/register. Cukup pilih produk dan lanjut bayar!",
                    });
                  }}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Lanjut ke Pembayaran
                </Button>

                {/* Info */}
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <p>• Transaksi instan tanpa perlu daftar akun</p>
                  <p>• Pembayaran melalui QRIS, Transfer Bank, E-wallet</p>
                  <p>• Token/Pulsa dikirim langsung via SMS</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-600">24/7</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Layanan Non-Stop</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">100%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Otomatis</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-purple-600">{products.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Produk Tersedia</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-orange-600">5</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Kategori Layanan</div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}