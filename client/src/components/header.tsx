import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Wallet, User, LogIn } from "lucide-react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary">PulsaKu</h1>
              <p className="text-xs text-muted-foreground -mt-1">Powered by Digiflazz</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/" className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                Beranda
              </Link>
              <Link href="/status" className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                Cek Transaksi
              </Link>
              <a href="#products" className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                Produk
              </a>
              <a href="#contact" className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                Bantuan
              </a>

            </div>
          </div>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Wallet className="w-4 h-4 mr-2" />
              Saldo: Rp 0
            </Button>
            <Link href="/login">
              <Button variant="ghost" size="sm">
                <LogIn className="w-4 h-4 mr-2" />
                Masuk
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">
                <User className="w-4 h-4 mr-2" />
                Daftar
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-8">
                  <Link href="/" className="text-foreground hover:text-primary block px-3 py-2 rounded-md text-base font-medium">
                    Beranda
                  </Link>
                  <Link href="/status" className="text-muted-foreground hover:text-primary block px-3 py-2 rounded-md text-base font-medium">
                    Cek Transaksi
                  </Link>
                  <a href="#products" className="text-muted-foreground hover:text-primary block px-3 py-2 rounded-md text-base font-medium">
                    Produk
                  </a>
                  <a href="#contact" className="text-muted-foreground hover:text-primary block px-3 py-2 rounded-md text-base font-medium">
                    Bantuan
                  </a>

                  
                  <div className="border-t pt-4 space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Wallet className="w-4 h-4 mr-2" />
                      Saldo: Rp 0
                    </Button>
                    <Link href="/login" className="block">
                      <Button variant="ghost" className="w-full justify-start">
                        <LogIn className="w-4 h-4 mr-2" />
                        Masuk
                      </Button>
                    </Link>
                    <Link href="/register" className="block">
                      <Button className="w-full justify-start">
                        <User className="w-4 h-4 mr-2" />
                        Daftar
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}
