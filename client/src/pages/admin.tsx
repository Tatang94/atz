import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  RefreshCw, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  DollarSign,
  Package,
  Activity,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Filter
} from "lucide-react";

interface Transaction {
  id: string;
  refId: string;
  productName: string;
  category: string;
  operator: string;
  targetNumber: string;
  amount: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

interface Product {
  id: string;
  sku: string;
  productName: string;
  category: string;
  brand: string;
  price: string;
  sellerPrice: string;
  buyerPrice: string;
  isActive: boolean;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  balance: string;
  isActive: boolean;
  createdAt: string;
}

interface Stats {
  totalTransactions: number;
  totalRevenue: string;
  pendingTransactions: number;
  successfulTransactions: number;
  totalProducts: number;
  activeProducts: number;
  totalUsers: number;
  activeUsers: number;
}

export default function AdminPage() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const queryClient = useQueryClient();

  // Query untuk mendapatkan data admin
  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ['/api/admin/stats'],
    refetchInterval: 30000,
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/admin/transactions'],
    refetchInterval: 15000,
  });

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/admin/products', selectedCategory === 'all' ? '' : selectedCategory, selectedBrand, showActiveOnly],
    refetchInterval: 60000,
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    refetchInterval: 60000,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/admin/categories'],
    refetchInterval: 300000,
  });

  // Mutations untuk aksi admin
  const syncProductsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/products/sync', {});
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Sukses", description: "Produk berhasil disinkronisasi dari Digiflazz" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/categories'] });
    },
    onError: () => {
      toast({ title: "Error", description: "Gagal sinkronisasi produk", variant: "destructive" });
    },
  });

  const clearProductsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', '/api/admin/products', {});
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Sukses", description: "Semua produk berhasil dihapus" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/categories'] });
    },
    onError: () => {
      toast({ title: "Error", description: "Gagal menghapus produk", variant: "destructive" });
    },
  });

  const testDigiflazzMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('GET', '/api/admin/test-digiflazz', {});
      return response.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: "Koneksi Digiflazz Berhasil", 
        description: `Saldo: Rp ${data.balance?.toLocaleString('id-ID')} | Produk: ${data.productCount}` 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Koneksi Digiflazz Gagal", 
        description: error.message || "Periksa konfigurasi API", 
        variant: "destructive" 
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ sku, data }: { sku: string; data: any }) => {
      const response = await apiRequest('PATCH', `/api/admin/products/${sku}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Sukses", description: "Produk berhasil diperbarui" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
    onError: () => {
      toast({ title: "Error", description: "Gagal memperbarui produk", variant: "destructive" });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(parseInt(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter produk berdasarkan pencarian
  const filteredProducts = products.filter(product => 
    product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (statsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <span className="ml-2">Memuat data admin...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Panel Admin</h1>
          <p className="text-muted-foreground">Kelola aplikasi pulsa dan pembayaran Anda</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={() => testDigiflazzMutation.mutate()}
            disabled={testDigiflazzMutation.isPending}
            variant="outline"
            size="sm"
          >
            <Activity className="w-4 h-4 mr-2" />
            Test Digiflazz
          </Button>
          <Button 
            onClick={() => syncProductsMutation.mutate()}
            disabled={syncProductsMutation.isPending}
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${syncProductsMutation.isPending ? 'animate-spin' : ''}`} />
            Sync Produk
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Dashboard</TabsTrigger>
          <TabsTrigger value="products">Produk</TabsTrigger>
          <TabsTrigger value="transactions">Transaksi</TabsTrigger>
          <TabsTrigger value="users">Pengguna</TabsTrigger>
        </TabsList>

        {/* Dashboard Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
                <ShoppingCart className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalTransactions || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.pendingTransactions || 0} pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
                <DollarSign className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.totalRevenue ? formatCurrency(stats.totalRevenue) : 'Rp 0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.successfulTransactions || 0} sukses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
                <Package className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.activeProducts || 0} aktif
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
                <Users className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.activeUsers || 0} aktif
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Transaksi Terbaru</CardTitle>
                <CardDescription>5 transaksi terakhir dalam sistem</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{transaction.productName}</p>
                        <p className="text-xs text-muted-foreground">{transaction.targetNumber}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(transaction.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={`${getStatusColor(transaction.status)} mb-1`}>
                          {transaction.status}
                        </Badge>
                        <p className="text-sm font-medium">{formatCurrency(transaction.amount)}</p>
                      </div>
                    </div>
                  ))}
                  {transactions.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">Belum ada transaksi</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kategori Produk</CardTitle>
                <CardDescription>Distribusi produk berdasarkan kategori</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(categories) ? categories.slice(0, 6).map((category: any) => (
                    <div key={category.name} className="flex items-center justify-between p-3 rounded-lg border">
                      <span className="capitalize font-medium">{category.name}</span>
                      <Badge variant="secondary">{category.count} produk</Badge>
                    </div>
                  )) : (
                    <p className="text-center text-muted-foreground py-8">Memuat kategori...</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Products Management */}
        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <CardTitle>Manajemen Produk</CardTitle>
                  <CardDescription>Kelola produk dan harga dari Digiflazz API</CardDescription>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Hapus Semua
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus Semua Produk?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tindakan ini akan menghapus semua produk dari database. 
                        Tindakan ini tidak dapat dibatalkan.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => clearProductsMutation.mutate()}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Hapus Semua
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filter Controls */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <Label htmlFor="search">Cari Produk</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="search"
                      placeholder="Nama produk, brand, SKU..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="category">Kategori</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Semua kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua kategori</SelectItem>
                      <SelectItem value="pulsa">Pulsa</SelectItem>
                      <SelectItem value="data">Paket Data</SelectItem>
                      <SelectItem value="pln">PLN</SelectItem>
                      <SelectItem value="game">Game</SelectItem>
                      <SelectItem value="ewallet">E-Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="brand">Brand/Operator</Label>
                  <Input 
                    id="brand"
                    placeholder="Filter by brand..."
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="active-only"
                      checked={showActiveOnly}
                      onCheckedChange={setShowActiveOnly}
                    />
                    <Label htmlFor="active-only">Hanya Aktif</Label>
                  </div>
                </div>
              </div>

              {/* Products Table */}
              {productsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  <span className="ml-2">Memuat produk...</span>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SKU</TableHead>
                        <TableHead>Nama Produk</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Harga Jual</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.slice(0, 20).map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate" title={product.productName}>
                              {product.productName}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {product.category}
                            </Badge>
                          </TableCell>
                          <TableCell>{product.brand}</TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(product.buyerPrice)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {product.isActive ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                              <span className="text-xs">
                                {product.isActive ? 'Aktif' : 'Nonaktif'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => {
                                updateProductMutation.mutate({
                                  sku: product.sku,
                                  data: { isActive: !product.isActive }
                                });
                              }}
                              disabled={updateProductMutation.isPending}
                            >
                              {product.isActive ? (
                                <>
                                  <EyeOff className="w-3 h-3 mr-1" />
                                  Nonaktifkan
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3 h-3 mr-1" />
                                  Aktifkan
                                </>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {filteredProducts.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      {products.length === 0 ? "Belum ada produk. Silakan sync produk dari Digiflazz." : "Tidak ada produk yang sesuai dengan filter."}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions */}
        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Transaksi</CardTitle>
              <CardDescription>Pantau semua transaksi dalam sistem</CardDescription>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  <span className="ml-2">Memuat transaksi...</span>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ref ID</TableHead>
                        <TableHead>Produk</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Jumlah</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tanggal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-mono text-xs">{transaction.refId}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{transaction.productName}</p>
                              <p className="text-xs text-muted-foreground capitalize">
                                {transaction.category} • {transaction.operator}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono">{transaction.targetNumber}</TableCell>
                          <TableCell className="font-medium">{formatCurrency(transaction.amount)}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(transaction.status)}>
                              {transaction.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(transaction.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {transactions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Belum ada transaksi
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manajemen Pengguna</CardTitle>
              <CardDescription>Kelola akun pengguna dan role</CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  <span className="ml-2">Memuat pengguna...</span>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Saldo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Bergabung</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={user.role === 'admin' ? 'default' : 'secondary'}
                              className="capitalize"
                            >
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{formatCurrency(user.balance)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {user.isActive ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                              <span className="text-xs">
                                {user.isActive ? 'Aktif' : 'Nonaktif'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(user.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {users.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Belum ada pengguna terdaftar
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}