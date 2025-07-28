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
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  RefreshCw, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  DollarSign,
  Package,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  Trash2
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

  // Fetch admin data
  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ['/api/admin/stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/admin/transactions'],
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/admin/products', selectedCategory === 'all' ? '' : selectedCategory, selectedBrand, showActiveOnly],
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    refetchInterval: 60000,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/admin/categories'],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Mutations
  const syncProductsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/products/sync', {});
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Sukses", description: "Produk berhasil disinkronisasi dari Digiflazz" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
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
    },
    onError: () => {
      toast({ title: "Error", description: "Gagal memperbarui produk", variant: "destructive" });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(parseInt(amount));
  };

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Panel Admin</h1>
          <p className="text-muted-foreground">Kelola aplikasi pulsa dan pembayaran Anda</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => testDigiflazzMutation.mutate()}
            disabled={testDigiflazzMutation.isPending}
            variant="outline"
          >
            <Activity className="w-4 h-4 mr-2" />
            Test Digiflazz
          </Button>
          <Button 
            onClick={() => syncProductsMutation.mutate()}
            disabled={syncProductsMutation.isPending}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${syncProductsMutation.isPending ? 'animate-spin' : ''}`} />
            Sync Produk
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Ringkasan</TabsTrigger>
          <TabsTrigger value="products">Produk</TabsTrigger>
          <TabsTrigger value="transactions">Transaksi</TabsTrigger>
          <TabsTrigger value="users">Pengguna</TabsTrigger>
        </TabsList>

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
                  {stats?.pendingTransactions || 0} menunggu
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
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{transaction.productName}</p>
                        <p className="text-sm text-muted-foreground">{transaction.targetNumber}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                        <p className="text-sm">{formatCurrency(transaction.amount)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kategori Produk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(categories) ? categories.slice(0, 6).map((category: any) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <span className="capitalize">{category.name}</span>
                      <Badge variant="secondary">{category.count} produk</Badge>
                    </div>
                  )) : null}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Manajemen Produk</CardTitle>
                  <CardDescription>Kelola produk dan harga dari Digiflazz API</CardDescription>
                </div>
                <div className="flex gap-2">
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
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
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
                <div className="flex-1">
                  <Label htmlFor="brand">Brand/Operator</Label>
                  <Input 
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

              {productsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  <span className="ml-2">Memuat produk...</span>
                </div>
              ) : (
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
                    {products.slice(0, 20).map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                        <TableCell className="max-w-xs truncate">{product.productName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {product.category}
                          </Badge>
                        </TableCell>
                        <TableCell>{product.brand}</TableCell>
                        <TableCell>{formatCurrency(product.buyerPrice)}</TableCell>
                        <TableCell>
                          {product.isActive ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => {
                              // Toggle product status
                              updateProductMutation.mutate({
                                sku: product.sku,
                                data: { isActive: !product.isActive }
                              });
                            }}
                          >
                            {product.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ref ID</TableHead>
                      <TableHead>Produk</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Jumlah</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Metode Bayar</TableHead>
                      <TableHead>Tanggal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-mono text-xs">{transaction.refId}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{transaction.productName}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {transaction.category} • {transaction.operator}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">{transaction.targetNumber}</TableCell>
                        <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{transaction.paymentMethod}</TableCell>
                        <TableCell>
                          {new Date(transaction.createdAt).toLocaleDateString('id-ID')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

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
                        <TableCell>{formatCurrency(user.balance)}</TableCell>
                        <TableCell>
                          {user.isActive ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString('id-ID')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}