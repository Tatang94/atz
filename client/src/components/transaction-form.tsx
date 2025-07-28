import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Smartphone, Wifi, Zap, Gamepad2, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ProductSelector from "./product-selector";
import PaymentMethods from "./payment-methods";

const transactionSchema = z.object({
  phoneNumber: z.string().min(10, "Nomor handphone minimal 10 digit"),
  productCode: z.string().min(1, "Pilih produk terlebih dahulu"),
  paymentMethod: z.string().min(1, "Pilih metode pembayaran"),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

const categories = [
  { id: 'pulsa', label: 'Pulsa', icon: Smartphone },
  { id: 'data', label: 'Paket Data', icon: Wifi },
  { id: 'pln', label: 'Token PLN', icon: Zap },
  { id: 'game', label: 'Game', icon: Gamepad2 },
  { id: 'ewallet', label: 'E-Wallet', icon: Wallet },
];

interface DetectedOperator {
  operator: string;
  phoneNumber: string;
}

interface Product {
  id: string;
  sku: string;
  productName: string;
  category: string;
  brand: string;
  buyerPrice: string;
  isActive: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  type: string;
}

export default function TransactionForm() {
  const [selectedCategory, setSelectedCategory] = useState('pulsa');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [detectedOperator, setDetectedOperator] = useState<DetectedOperator | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      phoneNumber: "",
      productCode: "",
      paymentMethod: "",
    },
  });

  const detectOperatorMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      const response = await apiRequest('POST', '/api/detect-operator', { phoneNumber });
      return response.json();
    },
    onSuccess: (data: DetectedOperator) => {
      setDetectedOperator(data);
      if (data.operator) {
        toast({
          title: "Operator Terdeteksi",
          description: `Operator ${data.operator} berhasil terdeteksi`,
        });
      }
    },
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (data: TransactionFormData) => {
      const response = await apiRequest('POST', '/api/transactions', {
        productCode: data.productCode,
        targetNumber: data.phoneNumber,
        paymentMethod: data.paymentMethod,
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Transaksi Dibuat",
        description: "Anda akan diarahkan ke halaman pembayaran",
      });
      
      // Redirect to payment page
      if (data.paymentUrl) {
        window.open(data.paymentUrl, '_blank');
      }
      
      // Reset form
      form.reset();
      setSelectedProduct(null);
      setSelectedPaymentMethod(null);
      setDetectedOperator(null);
      
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
    },
    onError: (error: any) => {
      toast({
        title: "Gagal Membuat Transaksi",
        description: error.message || "Terjadi kesalahan saat membuat transaksi",
        variant: "destructive",
      });
    },
  });

  const handlePhoneNumberChange = (value: string) => {
    form.setValue('phoneNumber', value);
    
    if (value.length >= 4) {
      detectOperatorMutation.mutate(value);
    }
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    form.setValue('productCode', product.sku);
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    form.setValue('paymentMethod', method.id);
  };

  const onSubmit = (data: TransactionFormData) => {
    createTransactionMutation.mutate(data);
  };

  const calculateTotal = () => {
    if (!selectedProduct) return 0;
    return parseInt(selectedProduct.buyerPrice);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Category Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Pilih Kategori Produk</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const IconComponent = category.icon;
              const isSelected = selectedCategory === category.id;
              
              return (
                <Button
                  key={category.id}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setSelectedProduct(null);
                    form.setValue('productCode', '');
                  }}
                  className="flex items-center gap-2"
                >
                  <IconComponent className="w-4 h-4" />
                  {category.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Phone Number Input */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Transaksi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Handphone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="08xxxxxxxxxx"
                          {...field}
                          onChange={(e) => handlePhoneNumberChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                      {detectedOperator?.operator && (
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">
                            Operator: {detectedOperator.operator}
                          </Badge>
                        </div>
                      )}
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium">Provider</label>
                  <div className="p-3 border rounded-md bg-muted/50">
                    {detectedOperator?.operator ? (
                      <span className="text-sm">{detectedOperator.operator}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Operator akan terdeteksi otomatis</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Pilih Produk</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="productCode"
                render={() => (
                  <FormItem>
                    <FormControl>
                      <ProductSelector
                        selectedCategory={selectedCategory}
                        selectedProduct={selectedProduct?.sku || null}
                        onProductSelect={handleProductSelect}
                        operator={detectedOperator?.operator}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Metode Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="paymentMethod"
                render={() => (
                  <FormItem>
                    <FormControl>
                      <PaymentMethods
                        selectedMethod={selectedPaymentMethod?.id || null}
                        onMethodSelect={handlePaymentMethodSelect}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Transaction Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Transaksi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Produk:</span>
                  <span className="font-medium">
                    {selectedProduct?.productName || 'Belum dipilih'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Nomor Tujuan:</span>
                  <span className="font-medium">
                    {form.watch('phoneNumber') || 'Belum diisi'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Metode Pembayaran:</span>
                  <span className="font-medium">
                    {selectedPaymentMethod?.name || 'Belum dipilih'}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total Bayar:</span>
                  <span className="text-primary">
                    Rp {calculateTotal().toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={createTransactionMutation.isPending || !selectedProduct || !selectedPaymentMethod}
              >
                {createTransactionMutation.isPending ? (
                  "Memproses..."
                ) : (
                  "Bayar Sekarang"
                )}
              </Button>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
