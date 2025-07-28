import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, Building2, Smartphone, CreditCard, Wallet } from "lucide-react";

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  type: string;
}

interface PaymentMethodsProps {
  selectedMethod: string | null;
  onMethodSelect: (method: PaymentMethod) => void;
}

const iconMap = {
  qrcode: QrCode,
  university: Building2,
  'mobile-alt': Smartphone,
  'credit-card': CreditCard,
  wallet: Wallet,
  'shopping-bag': Wallet,
};

export default function PaymentMethods({ selectedMethod, onMethodSelect }: PaymentMethodsProps) {
  const { data: paymentMethods = [], isLoading } = useQuery<PaymentMethod[]>({
    queryKey: ['/api/payment-methods'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="w-8 h-8 bg-gray-200 rounded mb-2 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded mb-1"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  const groupedMethods = paymentMethods.reduce((acc: any, method: PaymentMethod) => {
    if (!acc[method.type]) {
      acc[method.type] = [];
    }
    acc[method.type].push(method);
    return acc;
  }, {});

  const typeLabels = {
    qris: 'QR Code',
    va: 'Virtual Account',
    ewallet: 'E-Wallet',
    convenience: 'Convenience Store',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Metode Pembayaran</h3>
        <Badge variant="secondary">
          {paymentMethods.length} metode tersedia
        </Badge>
      </div>
      
      {paymentMethods.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Metode pembayaran sedang dipersiapkan</p>
          <p className="text-sm">Silakan coba lagi nanti</p>
        </div>
      )}

      {Object.entries(groupedMethods).map(([type, methods]: [string, any]) => (
        <div key={type} className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {typeLabels[type as keyof typeof typeLabels] || type}
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {methods.map((method: PaymentMethod) => {
              const isSelected = selectedMethod === method.id;
              const IconComponent = iconMap[method.icon as keyof typeof iconMap] || CreditCard;
              
              return (
                <Card
                  key={method.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-gray-300'
                  }`}
                  onClick={() => onMethodSelect(method)}
                >
                  <div className="text-center space-y-2">
                    <div className="flex justify-center">
                      <div className={`p-2 rounded-lg ${
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-foreground">
                        {method.name}
                      </div>
                      {method.type === 'qris' && (
                        <div className="text-xs text-muted-foreground">
                          Scan & Pay
                        </div>
                      )}
                      {method.type === 'va' && (
                        <div className="text-xs text-muted-foreground">
                          Transfer Bank
                        </div>
                      )}
                      {method.type === 'ewallet' && (
                        <div className="text-xs text-muted-foreground">
                          Digital Wallet
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
