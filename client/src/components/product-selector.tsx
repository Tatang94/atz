import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Wifi, Zap, Gamepad2, Wallet, CreditCard } from "lucide-react";

interface Product {
  id: string;
  sku: string;
  productName: string;
  category: string;
  brand: string;
  buyerPrice: string;
  isActive: boolean;
}

interface ProductSelectorProps {
  selectedCategory: string;
  selectedProduct: string | null;
  onProductSelect: (product: Product) => void;
  operator?: string;
}

const categoryIcons = {
  pulsa: Smartphone,
  data: Wifi,
  pln: Zap,
  game: Gamepad2,
  ewallet: Wallet,
  voucher: CreditCard,
};

export default function ProductSelector({ 
  selectedCategory, 
  selectedProduct, 
  onProductSelect,
  operator 
}: ProductSelectorProps) {
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products', selectedCategory],
    enabled: !!selectedCategory,
  });

  const filteredProducts = products.filter((product: Product) => {
    // Only show active products (controlled by admin)
    if (!product.isActive) return false;
    
    if (!operator) return true;
    return product.brand.toLowerCase().includes(operator.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="p-3 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground mb-4">
          {operator ? `Tidak ada produk ${selectedCategory} untuk ${operator}` : `Tidak ada produk ${selectedCategory} tersedia`}
        </div>
        <p className="text-sm text-muted-foreground">
          Silakan pilih operator lain atau kategori produk lain
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Pilih Produk</h3>
        <Badge variant="secondary">
          {filteredProducts.length} produk tersedia
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredProducts.map((product: Product) => {
          const isSelected = selectedProduct === product.sku;
          const IconComponent = categoryIcons[product.category as keyof typeof categoryIcons] || Smartphone;
          
          return (
            <Card
              key={product.sku}
              className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-gray-300'
              }`}
              onClick={() => onProductSelect(product)}
            >
              <div className="flex items-start justify-between mb-2">
                <IconComponent className="w-4 h-4 text-muted-foreground" />
                <Badge 
                  variant={product.isActive ? "default" : "secondary"}
                  className="text-xs"
                >
                  {product.isActive ? "Tersedia" : "Habis"}
                </Badge>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm font-medium text-foreground line-clamp-2">
                  {product.productName}
                </div>
                <div className="text-sm font-semibold text-primary">
                  Rp {parseInt(product.buyerPrice).toLocaleString('id-ID')}
                </div>
                {product.brand && (
                  <div className="text-xs text-muted-foreground capitalize">
                    {product.brand}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
