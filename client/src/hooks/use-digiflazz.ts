import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface Product {
  id: string;
  sku: string;
  productName: string;
  category: string;
  brand: string;
  type: string;
  price: string;
  sellerPrice: string;
  buyerPrice: string;
  isActive: boolean;
  description?: string;
}

export interface SyncProductsResponse {
  message: string;
  count: number;
}

// Hook to get all products
export function useProducts() {
  return useQuery({
    queryKey: ['/api/products'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to get products by category
export function useProductsByCategory(category: string) {
  return useQuery({
    queryKey: ['/api/products', category],
    enabled: !!category,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to sync products from Digiflazz
export function useSyncProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<SyncProductsResponse> => {
      const response = await apiRequest('POST', '/api/products/sync', {});
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all product queries after sync
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
  });
}

// Hook to detect operator from phone number
export function useDetectOperator() {
  return useMutation({
    mutationFn: async (phoneNumber: string): Promise<{ operator: string; phoneNumber: string }> => {
      const response = await apiRequest('POST', '/api/detect-operator', { phoneNumber });
      return response.json();
    },
  });
}

// Hook to get payment methods
export function usePaymentMethods() {
  return useQuery({
    queryKey: ['/api/payment-methods'],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Custom hook to filter products by operator
export function useProductsByOperator(category: string, operator?: string) {
  const { data: products = [], ...query } = useProductsByCategory(category);

  const filteredProducts = operator 
    ? (products as Product[]).filter((product: Product) => 
        product.brand.toLowerCase().includes(operator.toLowerCase())
      )
    : (products as Product[]);

  return {
    ...query,
    data: filteredProducts,
  };
}

// Custom hook to search products
export function useSearchProducts(searchTerm: string, category?: string) {
  const { data: products = [], ...query } = category 
    ? useProductsByCategory(category)
    : useProducts();

  const filteredProducts = searchTerm
    ? (products as Product[]).filter((product: Product) =>
        product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : (products as Product[]);

  return {
    ...query,
    data: filteredProducts,
  };
}

// Helper function to format price in Indonesian Rupiah
export function formatPrice(price: string | number): string {
  const numPrice = typeof price === 'string' ? parseInt(price) : price;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(numPrice);
}

// Helper function to get operator color class
export function getOperatorColor(operator: string): string {
  const operatorLower = operator.toLowerCase();
  
  if (operatorLower.includes('telkomsel')) return 'text-red-600 bg-red-50 border-red-200';
  if (operatorLower.includes('indosat')) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  if (operatorLower.includes('xl')) return 'text-blue-600 bg-blue-50 border-blue-200';
  if (operatorLower.includes('tri') || operatorLower.includes('three')) return 'text-orange-600 bg-orange-50 border-orange-200';
  if (operatorLower.includes('axis')) return 'text-purple-600 bg-purple-50 border-purple-200';
  if (operatorLower.includes('smartfren')) return 'text-pink-600 bg-pink-50 border-pink-200';
  
  return 'text-gray-600 bg-gray-50 border-gray-200';
}

// Helper function to get category icon name
export function getCategoryIcon(category: string): string {
  switch (category.toLowerCase()) {
    case 'pulsa':
      return 'smartphone';
    case 'data':
      return 'wifi';
    case 'pln':
      return 'zap';
    case 'game':
      return 'gamepad-2';
    case 'ewallet':
      return 'wallet';
    case 'voucher':
      return 'credit-card';
    default:
      return 'package';
  }
}
