import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";

const statusCheckSchema = z.object({
  reference: z.string().min(1, "Masukkan ID transaksi atau nomor HP"),
});

type StatusCheckData = z.infer<typeof statusCheckSchema>;

interface Transaction {
  id: string;
  refId: string;
  productName: string;
  targetNumber: string;
  totalAmount: string;
  status: string;
  createdAt: string;
  sn?: string;
  message?: string;
}

const statusConfig = {
  pending: {
    icon: Clock,
    label: "Menunggu Pembayaran",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    description: "Transaksi sedang menunggu pembayaran dari Anda"
  },
  processing: {
    icon: Loader2,
    label: "Sedang Diproses",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    description: "Pembayaran berhasil, transaksi sedang diproses"
  },
  success: {
    icon: CheckCircle,
    label: "Berhasil",
    color: "bg-green-100 text-green-800 border-green-200",
    description: "Transaksi berhasil diselesaikan"
  },
  failed: {
    icon: XCircle,
    label: "Gagal",
    color: "bg-red-100 text-red-800 border-red-200",
    description: "Transaksi gagal diproses"
  },
  expired: {
    icon: AlertCircle,
    label: "Kedaluwarsa",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    description: "Transaksi kedaluwarsa karena tidak ada pembayaran"
  }
};

export default function TransactionStatus() {
  const [searchReference, setSearchReference] = useState<string>("");

  const form = useForm<StatusCheckData>({
    resolver: zodResolver(statusCheckSchema),
    defaultValues: {
      reference: "",
    },
  });

  const { data: transaction, isLoading, error, refetch } = useQuery<Transaction>({
    queryKey: ['/api/transactions', searchReference, 'status'],
    enabled: !!searchReference,
    refetchInterval: (data) => {
      // Auto-refresh if transaction is pending or processing
      if (data?.status === 'pending' || data?.status === 'processing') {
        return 5000; // 5 seconds
      }
      return false;
    },
  });

  const onSubmit = (data: StatusCheckData) => {
    setSearchReference(data.reference);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
    });
  };

  const getStatusConfig = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="py-16 bg-muted/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">Cek Status Transaksi</h1>
            <p className="text-muted-foreground text-lg">
              Pantau status transaksi Anda secara real-time
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Masukkan Informasi Transaksi</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="reference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Transaksi atau Nomor HP</FormLabel>
                        <div className="flex gap-3">
                          <FormControl>
                            <Input
                              placeholder="Masukkan ID transaksi atau nomor HP"
                              {...field}
                            />
                          </FormControl>
                          <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <Search className="w-4 h-4 mr-2" />
                            )}
                            Cek Status
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Transaction Status Result */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center text-red-600">
                  <XCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">Transaksi tidak ditemukan</span>
                </div>
                <p className="text-red-600 text-sm mt-1">
                  Pastikan ID transaksi atau nomor HP yang Anda masukkan benar
                </p>
              </CardContent>
            </Card>
          )}

          {transaction && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Detail Transaksi</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Search className="w-4 h-4 mr-2" />
                    )}
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status Badge */}
                <div className="flex items-center justify-center">
                  {(() => {
                    const config = getStatusConfig(transaction.status);
                    const IconComponent = config.icon;
                    return (
                      <div className="text-center">
                        <div className={`inline-flex items-center px-4 py-2 rounded-full border ${config.color}`}>
                          <IconComponent className={`w-5 h-5 mr-2 ${transaction.status === 'processing' ? 'animate-spin' : ''}`} />
                          <span className="font-semibold">{config.label}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {config.description}
                        </p>
                      </div>
                    );
                  })()}
                </div>

                <Separator />

                {/* Transaction Details */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">ID Transaksi</label>
                      <p className="font-mono text-sm bg-muted px-3 py-2 rounded mt-1">{transaction.refId}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Produk</label>
                      <p className="font-medium mt-1">{transaction.productName}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nomor Tujuan</label>
                      <p className="font-medium mt-1">{transaction.targetNumber}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Total Bayar</label>
                      <p className="font-semibold text-lg text-primary mt-1">
                        Rp {parseInt(transaction.totalAmount).toLocaleString('id-ID')}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Waktu Transaksi</label>
                      <p className="font-medium mt-1">{formatDate(transaction.createdAt)}</p>
                    </div>

                    {transaction.sn && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Serial Number</label>
                        <p className="font-mono text-sm bg-muted px-3 py-2 rounded mt-1">{transaction.sn}</p>
                      </div>
                    )}
                  </div>
                </div>

                {transaction.message && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Pesan</label>
                      <p className="text-sm bg-muted px-3 py-2 rounded mt-1">{transaction.message}</p>
                    </div>
                  </>
                )}

                {/* Action based on status */}
                {transaction.status === 'pending' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800 mb-1">Menunggu Pembayaran</h4>
                        <p className="text-sm text-yellow-700">
                          Silakan lakukan pembayaran sesuai dengan metode yang dipilih. 
                          Transaksi akan diproses otomatis setelah pembayaran diterima.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {transaction.status === 'success' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-800 mb-1">Transaksi Berhasil</h4>
                        <p className="text-sm text-green-700">
                          Transaksi Anda telah berhasil diproses. Terima kasih telah menggunakan layanan PulsaKu.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {transaction.status === 'failed' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <XCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-800 mb-1">Transaksi Gagal</h4>
                        <p className="text-sm text-red-700">
                          Maaf, transaksi Anda gagal diproses. Jika ada dana yang terpotong, 
                          akan dikembalikan dalam 1x24 jam.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Help Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Butuh Bantuan?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Jika Anda mengalami kesulitan atau memiliki pertanyaan tentang transaksi, 
                jangan ragu untuk menghubungi customer service kami.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="flex-1">
                  <span className="mr-2">📞</span>
                  Hubungi CS: +62 21 1234 5678
                </Button>
                <Button variant="outline" className="flex-1">
                  <span className="mr-2">💬</span>
                  WhatsApp: +62 812 3456 7890
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
