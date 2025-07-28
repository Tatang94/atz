import crypto from "crypto";

export interface PayDisiniConfig {
  apiKey: string;
  productionMode: boolean;
}

export interface PayDisiniPaymentRequest {
  key: string;
  request: string;
  unique_code: string;
  service: string;
  amount: string;
  note: string;
  valid_time: string;
  type_fee: string;
  payment_guide: boolean;
  signature: string;
  return_url?: string;
}

export interface PayDisiniPaymentResponse {
  success: boolean;
  msg: string;
  data?: {
    pay_id: string;
    unique_code: string;
    service: string;
    service_name: string;
    amount: string;
    balance: string;
    fee: string;
    status: string;
    expired: string;
    qr_content?: string;
    qrcode_url?: string;
    checkout_url: string;
    checkout_url_v2: string;
    checkout_url_v3: string;
  };
}

export interface PayDisiniStatusResponse {
  success: boolean;
  msg: string;
  data?: {
    pay_id: string;
    unique_code: string;
    status: string;
    amount: string;
    balance: string;
    fee: string;
    expired: string;
    created_at: string;
  };
}

export class PayDisiniService {
  private config: PayDisiniConfig;
  private baseUrl: string;

  constructor(config: PayDisiniConfig) {
    this.config = config;
    this.baseUrl = "https://api.paydisini.co.id/v1/";
  }

  private generateSignature(key: string, uniqueCode: string, service: string, amount: string, validTime: string, note: string): string {
    const data = key + uniqueCode + service + amount + validTime + note;
    return crypto.createHash('md5').update(data).digest('hex');
  }

  async createPayment(
    uniqueCode: string,
    serviceId: string,
    amount: string,
    note: string,
    validTime: string = "1800",
    returnUrl?: string
  ): Promise<PayDisiniPaymentResponse> {
    try {
      const signature = this.generateSignature(
        this.config.apiKey,
        uniqueCode,
        serviceId,
        amount,
        validTime,
        note
      );

      const requestData: PayDisiniPaymentRequest = {
        key: this.config.apiKey,
        request: 'new',
        unique_code: uniqueCode,
        service: serviceId,
        amount: amount,
        note: note,
        valid_time: validTime,
        type_fee: '1',
        payment_guide: true,
        signature: signature,
        return_url: returnUrl,
      };

      const formData = new URLSearchParams();
      Object.entries(requestData).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const data: PayDisiniPaymentResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.msg || 'Payment creation failed');
      }

      return data;
    } catch (error) {
      console.error('Error creating PayDisini payment:', error);
      throw error;
    }
  }

  async checkPaymentStatus(uniqueCode: string): Promise<PayDisiniStatusResponse> {
    try {
      const signature = crypto.createHash('md5')
        .update(this.config.apiKey + uniqueCode)
        .digest('hex');

      const formData = new URLSearchParams({
        key: this.config.apiKey,
        request: 'status',
        unique_code: uniqueCode,
        signature: signature,
      });

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const data: PayDisiniStatusResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.msg || 'Failed to check payment status');
      }

      return data;
    } catch (error) {
      console.error('Error checking PayDisini payment status:', error);
      throw error;
    }
  }

  async getPaymentMethods(): Promise<any> {
    try {
      const signature = crypto.createHash('md5')
        .update(this.config.apiKey)
        .digest('hex');

      const formData = new URLSearchParams({
        key: this.config.apiKey,
        request: 'payment_guide',
        signature: signature,
      });

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.msg || 'Failed to fetch payment methods');
      }

      return data;
    } catch (error) {
      console.error('Error fetching PayDisini payment methods:', error);
      throw error;
    }
  }
}

export const payDisiniService = new PayDisiniService({
  apiKey: process.env.PAYDISINI_API_KEY || process.env.PAYDISINI_KEY || "",
  productionMode: process.env.NODE_ENV === "production",
});
