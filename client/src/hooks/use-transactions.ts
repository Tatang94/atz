import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface Transaction {
  id: string;
  refId: string;
  productCode: string;
  productName: string;
  category: string;
  operator?: string;
  targetNumber: string;
  amount: string;
  adminFee: string;
  totalAmount: string;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'expired';
  paymentMethod?: string;
  paymentReference?: string;
  paymentUrl?: string;
  sn?: string;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionRequest {
  productCode: string;
  targetNumber: string;
  paymentMethod: string;
}

export interface CreateTransactionResponse {
  transaction: Transaction;
  paymentUrl: string;
  qrCodeUrl?: string;
}

// Hook to create a new transaction
export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTransactionRequest): Promise<CreateTransactionResponse> => {
      const response = await apiRequest('POST', '/api/transactions', data);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate transaction queries
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
    },
  });
}

// Hook to get transaction status by reference ID
export function useTransactionStatus(refId: string) {
  return useQuery<Transaction>({
    queryKey: ['/api/transactions', refId, 'status'],
    enabled: !!refId,
    refetchInterval: (data) => {
      // Auto-refresh if transaction is pending or processing
      if (data?.status === 'pending' || data?.status === 'processing') {
        return 5000; // 5 seconds
      }
      return false;
    },
    staleTime: 0, // Always fetch fresh data for transaction status
  });
}

// Hook to get user transactions (would need user ID in real app)
export function useUserTransactions(userId?: string) {
  return useQuery({
    queryKey: ['/api/users', userId, 'transactions'],
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook to manually refresh transaction status
export function useRefreshTransactionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (refId: string): Promise<Transaction> => {
      const response = await apiRequest('GET', `/api/transactions/${refId}/status`);
      return response.json();
    },
    onSuccess: (data, refId) => {
      // Update the specific transaction query
      queryClient.setQueryData(['/api/transactions', refId, 'status'], data);
      // Invalidate user transactions to refresh lists
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
  });
}

// Helper function to get status configuration
export function getTransactionStatusConfig(status: Transaction['status']) {
  const configs = {
    pending: {
      label: 'Menunggu Pembayaran',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: 'clock',
      description: 'Transaksi sedang menunggu pembayaran dari Anda',
    },
    processing: {
      label: 'Sedang Diproses',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: 'loader',
      description: 'Pembayaran berhasil, transaksi sedang diproses',
    },
    success: {
      label: 'Berhasil',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: 'check-circle',
      description: 'Transaksi berhasil diselesaikan',
    },
    failed: {
      label: 'Gagal',
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: 'x-circle',
      description: 'Transaksi gagal diproses',
    },
    expired: {
      label: 'Kedaluwarsa',
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: 'alert-circle',
      description: 'Transaksi kedaluwarsa karena tidak ada pembayaran',
    },
  };

  return configs[status] || configs.pending;
}

// Helper function to format transaction date
export function formatTransactionDate(dateString: string): string {
  return new Date(dateString).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  });
}

// Helper function to calculate transaction fee percentage
export function calculateFeePercentage(amount: string, adminFee: string): number {
  const amountNum = parseInt(amount);
  const feeNum = parseInt(adminFee);
  
  if (amountNum === 0) return 0;
  return (feeNum / amountNum) * 100;
}

// Helper function to check if transaction can be retried
export function canRetryTransaction(status: Transaction['status']): boolean {
  return status === 'failed' || status === 'expired';
}

// Helper function to check if transaction is in progress
export function isTransactionInProgress(status: Transaction['status']): boolean {
  return status === 'pending' || status === 'processing';
}

// Helper function to get next expected status
export function getNextExpectedStatus(currentStatus: Transaction['status']): Transaction['status'] | null {
  switch (currentStatus) {
    case 'pending':
      return 'processing';
    case 'processing':
      return 'success';
    default:
      return null;
  }
}

// Hook for transaction statistics (for admin/reseller dashboard)
export function useTransactionStats(timeframe: 'today' | 'week' | 'month' = 'today') {
  return useQuery({
    queryKey: ['/api/transactions/stats', timeframe],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to search transactions by various criteria
export function useSearchTransactions(searchTerm: string, status?: Transaction['status']) {
  return useQuery({
    queryKey: ['/api/transactions/search', searchTerm, status],
    enabled: !!searchTerm || !!status,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}
