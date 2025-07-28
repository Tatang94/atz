import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import Header from "@/components/header";
import TransactionForm from "@/components/transaction-form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, Shield, Zap, Tags, 
  Smartphone, Wifi, Globe, 
  CreditCard, Gamepad2, Tv,
  CheckCircle, Users, Star,
  Phone, Mail, MapPin,
  Facebook, Instagram, MessageCircle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function Home() {
  const syncProductsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/products/sync', {});
      return response.json();
    },
  });

  useEffect(() => {
    // Sync products on page load
    syncProductsMutation.mutate();
  }, []);

  const operatorLogos = [
    { name: 'Telkomsel', color: 'text-red-600' },
    { name: 'Indosat', color: 'text-yellow-600' },
    { name: 'XL Axiata', color: 'text-blue-600' },
    { name: 'Tri (3)', color: 'text-orange-600' },
    { name: 'Axis', color: 'text-purple-600' },
    { name: 'Smartfren', color: 'text-pink-600' },
  ];

  const features = [
    {
      icon: Clock,
      title: "24/7 Non-Stop",
      description: "Layanan tersedia kapan saja, dimana saja tanpa batas waktu",
      color: "text-primary"
    },
    {
      icon: Shield,
      title: "Aman & Terpercaya",
      description: "Transaksi dilindungi dengan enkripsi tingkat bank",
      color: "text-secondary"
    },
    {
      icon: Zap,
      title: "Proses Instan",
      description: "Transaksi diproses dalam hitungan detik",
      color: "text-accent"
    },
    {
      icon: Tags,
      title: "Harga Terbaik",
      description: "Dapatkan harga termurah dengan kualitas terbaik",
      color: "text-purple-500"
    },
  ];

  const services = [
    {
      icon: Smartphone,
      title: "Pulsa & Paket Data",
      description: "Top up pulsa dan beli paket data untuk semua operator Indonesia",
      features: ["Telkomsel, Indosat, XL, Tri, Axis", "Paket Internet Harian & Bulanan", "Kuota Unlimited & Gaming"],
      gradient: "from-blue-50 to-blue-100"
    },
    {
      icon: Zap,
      title: "Token PLN",
      description: "Beli token listrik PLN prabayar dengan mudah dan cepat",
      features: ["Seluruh wilayah Indonesia", "Token dikirim via SMS & WhatsApp", "Proses instan 24 jam"],
      gradient: "from-yellow-50 to-yellow-100"
    },
    {
      icon: Gamepad2,
      title: "Game Voucher",
      description: "Top up game favorit dengan harga terbaik",
      features: ["Mobile Legends, Free Fire, PUBG", "Steam Wallet, Google Play", "Genshin Impact, Valorant"],
      gradient: "from-purple-50 to-purple-100"
    },
    {
      icon: CreditCard,
      title: "E-Wallet Top Up",
      description: "Isi saldo e-wallet untuk kemudahan transaksi digital",
      features: ["GoPay, OVO, DANA, ShopeePay", "LinkAja, Sakuku BCA", "Proses otomatis & real-time"],
      gradient: "from-green-50 to-green-100"
    },
    {
      icon: Globe,
      title: "Bayar Tagihan",
      description: "Bayar berbagai tagihan bulanan dengan praktis",
      features: ["BPJS Kesehatan & Ketenagakerjaan", "Internet & TV Kabel", "Multifinance & Pinjaman"],
      gradient: "from-red-50 to-red-100"
    },
    {
      icon: Tv,
      title: "Internet & TV",
      description: "Voucher internet dan berlangganan TV streaming",
      features: ["Netflix, Disney+, Vidio", "WiFi.ID, IndiHome", "Spotify Premium"],
      gradient: "from-indigo-50 to-indigo-100"
    },
  ];

  const testimonials = [
    {
      name: "Ahmad Rizki",
      initial: "A",
      rating: 5,
      text: "Sangat praktis dan cepat! Beli pulsa tidak perlu keluar rumah. Harga juga kompetitif dibanding counter pulsa biasa.",
      color: "bg-primary"
    },
    {
      name: "Sari Wulandari",
      initial: "S",
      rating: 5,
      text: "Transaksi 24 jam non-stop ini yang paling saya suka. Malam hari butuh pulsa darurat langsung bisa beli disini.",
      color: "bg-secondary"
    },
    {
      name: "Budi Santoso",
      initial: "B",
      rating: 5,
      text: "Sudah pakai hampir 2 tahun untuk top up game dan token listrik. Prosesnya selalu lancar dan customer service responsif.",
      color: "bg-accent"
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="gradient-primary text-white py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Platform Digital Terpercaya #1 Indonesia
            </h1>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto">
              Beli pulsa, paket data, token listrik, dan game voucher dengan mudah, cepat, dan aman 24/7
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl">
            <TransactionForm />
          </div>
        </div>
      </section>

      {/* Operator Logos */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-lg font-semibold text-foreground mb-6">
            Operator yang Didukung
          </h2>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
            {operatorLogos.map((operator) => (
              <div key={operator.name} className="w-20 h-12 bg-muted rounded flex items-center justify-center">
                <span className={`text-xs font-bold ${operator.color}`}>
                  {operator.name.split(' ')[0].toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Mengapa Pilih PulsaKu?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Platform digital terpercaya dengan teknologi terdepan untuk kemudahan transaksi Anda
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${feature.color} bg-opacity-10`}>
                    <IconComponent className={`${feature.color} text-2xl w-8 h-8`} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="products" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Semua Layanan Digital</h2>
            <p className="text-muted-foreground text-lg">
              Lengkapi kebutuhan digital Anda dalam satu platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <Card key={index} className={`bg-gradient-to-br ${service.gradient} hover:shadow-lg transition-shadow`}>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <div className="bg-primary w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                        <IconComponent className="text-white text-xl w-6 h-6" />
                      </div>
                      <h3 className="font-semibold text-foreground text-xl mb-2">{service.title}</h3>
                      <p className="text-muted-foreground mb-4">{service.description}</p>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center">
                          <CheckCircle className="text-secondary mr-2 w-4 h-4" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Apa Kata Pelanggan</h2>
            <p className="text-muted-foreground text-lg">
              Ribuan pelanggan sudah merasakan kemudahan bertransaksi di PulsaKu
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-background">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 ${testimonial.color} rounded-full flex items-center justify-center text-white font-semibold`}>
                      {testimonial.initial}
                    </div>
                    <div className="ml-3">
                      <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                      <div className="flex text-accent">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm italic">"{testimonial.text}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-foreground text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold text-primary mb-4">PulsaKu</h3>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Platform digital terpercaya di Indonesia yang menyediakan layanan top up pulsa, paket data, token listrik, 
                dan berbagai produk digital lainnya dengan teknologi terdepan.
              </p>
              <div className="flex space-x-4">
                <div className="bg-gray-700 p-2 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer">
                  <MessageCircle className="w-5 h-5 text-secondary" />
                </div>
                <div className="bg-gray-700 p-2 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer">
                  <Instagram className="w-5 h-5 text-pink-400" />
                </div>
                <div className="bg-gray-700 p-2 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer">
                  <Facebook className="w-5 h-5 text-blue-400" />
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Link Cepat</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-primary transition-colors">Cara Pembayaran</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Syarat & Ketentuan</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Kebijakan Privasi</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Hubungi Kami</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-semibold mb-4">Kontak</h4>
              <div className="space-y-3 text-gray-300">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-3 text-primary" />
                  <span>+62 21 1234 5678</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-3 text-primary" />
                  <span>support@pulsaku.com</span>
                </div>
                <div className="flex items-center">
                  <MessageCircle className="w-4 h-4 mr-3 text-secondary" />
                  <span>+62 812 3456 7890</span>
                </div>
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 mr-3 text-primary mt-1" />
                  <span>Jakarta, Indonesia</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-700 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2024 PulsaKu. Powered by Digiflazz & PayDisini. All rights reserved.
              </p>
              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                <div className="flex items-center text-sm text-gray-400">
                  <Shield className="w-4 h-4 text-secondary mr-2" />
                  <span>SSL Secured</span>
                </div>
                <div className="flex items-center text-sm text-gray-400">
                  <Clock className="w-4 h-4 text-accent mr-2" />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
