import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, User, Mail, Lock, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const registerSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter").max(20, "Username maksimal 20 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  confirmPassword: z.string(),
  role: z.string().min(1, "Pilih jenis akun"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Konfirmasi password tidak sesuai",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const { confirmPassword, ...registerData } = data;
      const response = await apiRequest('POST', '/api/auth/register', registerData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Registrasi Berhasil",
        description: "Akun Anda telah berhasil dibuat. Silakan login untuk melanjutkan.",
      });
      setLocation('/login');
    },
    onError: (error: any) => {
      toast({
        title: "Registrasi Gagal",
        description: error.message || "Terjadi kesalahan saat membuat akun",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="py-16 bg-muted/50 min-h-[calc(100vh-4rem)]">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Daftar Akun Baru</h1>
            <p className="text-muted-foreground">
              Bergabunglah dengan ribuan member PulsaKu dan nikmati keuntungan eksklusif
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">Registrasi Member</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              placeholder="Masukkan username"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-muted-foreground">
                          Username akan digunakan untuk login
                        </p>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              type="email"
                              placeholder="Masukkan email"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jenis Akun</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih jenis akun" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="user">User - Pengguna Umum</SelectItem>
                            <SelectItem value="reseller">Reseller - Dapatkan Harga Grosir</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                        <p className="text-xs text-muted-foreground">
                          Reseller mendapat harga khusus untuk dijual kembali
                        </p>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              type="password"
                              placeholder="Masukkan password"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Konfirmasi Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              type="password"
                              placeholder="Ulangi password"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Memproses..." : "Daftar Sekarang"}
                  </Button>
                </form>
              </Form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Sudah punya akun?{" "}
                  <Link href="/login" className="text-primary hover:underline font-medium">
                    Masuk di sini
                  </Link>
                </p>
              </div>

              <div className="mt-4 text-center">
                <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
                  ← Kembali ke beranda
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Benefits Section */}
          <div className="mt-6 space-y-4">
            {/* User Benefits */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Keuntungan User
                </h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                    Harga retail terjangkau
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                    Riwayat transaksi tersimpan
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                    Notifikasi status transaksi
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Reseller Benefits */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Keuntungan Reseller
                </h3>
                <ul className="space-y-2 text-sm text-green-800">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                    Harga grosir lebih murah
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                    Sistem deposit untuk stok saldo
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                    Laporan penjualan lengkap
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                    API akses untuk integrasi
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Terms */}
          <Card className="mt-6 bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground text-center">
                Dengan mendaftar, Anda menyetujui{" "}
                <a href="#" className="text-primary hover:underline">Syarat & Ketentuan</a>{" "}
                dan{" "}
                <a href="#" className="text-primary hover:underline">Kebijakan Privasi</a>{" "}
                PulsaKu
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
