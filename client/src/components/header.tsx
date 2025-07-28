import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

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

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Transaksi Instan Tanpa Akun
            </span>
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

                  
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground text-center px-3 py-2">
                      Transaksi Instan Tanpa Akun
                    </p>
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
