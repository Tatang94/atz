import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Settings,
  Key,
  RefreshCw, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  DollarSign,
  Package,
  Activity,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Save,
  TestTube,
  Smartphone,
  Wifi,
  Zap,
  Gamepad2,
  CreditCard,
  AlertCircle
} from "lucide-react";

export default function AdminNew() {
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [showPasswords, setShowPasswords] = useState(false);
  
  // Configuration states
  const [digiflazzUsername, setDigiflazzUsername] = useState("");
  const [digiflazzApiKey, setDigiflazzApiKey] = useState("");

  const queryClient = useQueryClient();

  // Fetch current configuration status
  const { data: configStatus, refetch: refetchConfig } = useQuery({
    queryKey: ['/api/config/status'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/config/status', {});
      return response.json();
    },
  });

  // Fetch admin stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/stats', {});
      return response.json();
    },
    refetchInterval: 30000,
  });

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/products', {});
      return response.json();
    },
    refetchInterval: 60000,
  });

  // Save configuration mutation
  const saveConfigMutation = useMutation({
    mutationFn: async (config: any) => {
      const response = await apiRequest('POST', '/api/admin/config', config);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Konfigurasi berhasil disimpan",
        description: "API key dan database telah dikonfigurasi",
      });
      refetchConfig();
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
    onError: (error: any) => {
      toast({
        title: "Gagal menyimpan konfigurasi",
        description: error.message || "Terjadi kesalahan",
        variant: "destructive",
      });
    },
  });

  // Test Digiflazz API mutation
  const testDigiflazzMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/admin/test-digiflazz', {});
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Test API berhasil",
        description: `Saldo Digiflazz: Rp ${data.balance?.toLocaleString('id-ID') || 0}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Test API gagal",
        description: error.message || "Periksa kembali username dan API key",
        variant: "destructive",
      });
    },
  });

  // Sync products mutation
  const syncProductsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/products/sync', {});
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Sinkronisasi berhasil",
        description: `${data.count || 0} produk berhasil disinkronisasi`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Sinkronisasi gagal",
        description: error.message || "Periksa konfigurasi API",
        variant: "destructive",
      });
    },
  });

  const handleSaveConfig = () => {
    saveConfigMutation.mutate();
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const categoryIcons = {
    pulsa: Smartphone,
    data: Wifi,
    pln: Zap,
    game: Gamepad2,
    ewallet: CreditCard,
  };

  const getProductsByCategory = (category: string) => {
    return products.filter((p: any) => p.category === category);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile-first Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Kelola aplikasi pulsa Indonesia
          </p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Mobile-optimized Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="dashboard" className="text-xs">
              <Activity className="w-4 h-4 mr-1" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="config" className="text-xs">
              <Settings className="w-4 h-4 mr-1" />
              Config
            </TabsTrigger>
            <TabsTrigger value="products" className="text-xs">
              <Package className="w-4 h-4 mr-1" />
              Produk
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4">
            {/* API Status Alert */}
            <Alert className={`${configStatus?.digiflazz ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : 'border-orange-200 bg-orange-50 dark:bg-orange-900/20'}`}>
              {configStatus?.digiflazz ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-orange-600" />
              )}
              <AlertDescription className={configStatus?.digiflazz ? 'text-green-700 dark:text-green-300' : 'text-orange-700 dark:text-orange-300'}>
                {configStatus?.message || 'Memuat status konfigurasi...'}
              </AlertDescription>
            </Alert>

            {/* Stats Cards - Mobile Grid */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Total Produk</p>
                      <p className="text-lg font-bold">{products.length}</p>
                    </div>
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Aktif</p>
                      <p className="text-lg font-bold text-green-600">
                        {products.filter((p: any) => p.isActive).length}
                      </p>
                    </div>
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Transaksi</p>
                      <p className="text-lg font-bold">{stats?.totalTransactions || 0}</p>
                    </div>
                    <ShoppingCart className="w-6 h-6 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Revenue</p>
                      <p className="text-lg font-bold text-green-600">
                        {stats?.totalRevenue ? formatCurrency(stats.totalRevenue) : 'Rp 0'}
                      </p>
                    </div>
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Category Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Produk per Kategori</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(categoryIcons).map(([category, Icon]) => {
                    const categoryProducts = getProductsByCategory(category);
                    const activeCount = categoryProducts.filter((p: any) => p.isActive).length;
                    
                    return (
                      <div key={category} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="font-medium capitalize">{category}</p>
                            <p className="text-xs text-gray-500">{categoryProducts.length} total</p>
                          </div>
                        </div>
                        <Badge variant={activeCount > 0 ? "default" : "secondary"}>
                          {activeCount} aktif
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="config" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Konfigurasi API Digiflazz
                </CardTitle>
                <CardDescription>
                  Masukkan kredensial Digiflazz untuk mengambil produk real
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="username">Username Digiflazz</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Masukkan username"
                    value={digiflazzUsername}
                    onChange={(e) => setDigiflazzUsername(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="apikey">API Key Digiflazz</Label>
                  <div className="relative mt-1">
                    <Input
                      id="apikey"
                      type={showPasswords ? "text" : "password"}
                      placeholder="Masukkan API key"
                      value={digiflazzApiKey}
                      onChange={(e) => setDigiflazzApiKey(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPasswords(!showPasswords)}
                    >
                      {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => testDigiflazzMutation.mutate()}
                    disabled={!digiflazzUsername || !digiflazzApiKey || testDigiflazzMutation.isPending}
                    variant="outline"
                    className="flex-1"
                  >
                    {testDigiflazzMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <TestTube className="w-4 h-4 mr-2" />
                    )}
                    Test API
                  </Button>
                  <Button
                    onClick={handleSaveConfig}
                    disabled={!digiflazzUsername || !digiflazzApiKey || saveConfigMutation.isPending}
                    className="flex-1"
                  >
                    {saveConfigMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Simpan
                  </Button>
                </div>
              </CardContent>
            </Card>


          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => syncProductsMutation.mutate()}
                disabled={syncProductsMutation.isPending || !configStatus?.digiflazz}
                className="flex-1"
              >
                {syncProductsMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Sinkronisasi Produk
              </Button>
            </div>

            {productsLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                <span>Memuat produk...</span>
              </div>
            ) : products.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">
                    Belum ada produk. Konfigurasi API Digiflazz dan sinkronisasi produk.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {products.map((product: any) => (
                  <Card key={product.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm mb-1">{product.productName}</h4>
                        <div className="flex gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {product.brand}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {product.category}
                          </Badge>
                          <Badge 
                            variant={product.isActive ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {product.isActive ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </div>
                        {product.description && (
                          <p className="text-xs text-gray-500 mb-2">{product.description}</p>
                        )}
                      </div>
                      <div className="text-right ml-3">
                        <div className="font-bold text-green-600 text-sm">
                          {formatCurrency(product.buyerPrice)}
                        </div>
                        <div className="text-xs text-gray-500 line-through">
                          {formatCurrency(product.price)}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}