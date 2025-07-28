import crypto from "crypto";

export interface DigiflazzConfig {
  username: string;
  apiKey: string;
  productionMode: boolean;
}

export interface DigiflazzProduct {
  buyer_sku_code: string;
  product_name: string;
  category: string;
  brand: string;
  type: string;
  price: number;
  seller_name: string;
  buyer_product_status: boolean;
  seller_product_status: boolean;
  unlimited_stock: boolean;
  stock: number;
  multi: boolean;
  start_cut_off: string;
  end_cut_off: string;
  desc: string;
}

export interface DigiflazzTransactionRequest {
  username: string;
  buyer_sku_code: string;
  customer_no: string;
  ref_id: string;
  sign: string;
}

export interface DigiflazzTransactionResponse {
  data: {
    ref_id: string;
    status: string;
    customer_no: string;
    buyer_sku_code: string;
    message: string;
    price: number;
    balance: number;
    trx_id: string;
    sn?: string;
    buyer_last_status?: string;
  };
}

export interface DigiflazzBalanceResponse {
  data: {
    deposit: number;
  };
}

export class DigiflazzService {
  private config: DigiflazzConfig;
  private baseUrl: string;

  constructor(config: DigiflazzConfig) {
    this.config = config;
    this.baseUrl = config.productionMode 
      ? "https://api.digiflazz.com/v1" 
      : "https://api.digiflazz.com/v1";
  }

  private generateSignature(username: string, apiKey: string, refId: string): string {
    const data = username + apiKey + refId;
    return crypto.createHash('md5').update(data).digest('hex');
  }

  async getProducts(): Promise<DigiflazzProduct[]> {
    try {
      const sign = crypto.createHash('md5')
        .update(this.config.username + this.config.apiKey + 'pricelist')
        .digest('hex');

      const response = await fetch(`${this.baseUrl}/price-list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cmd: 'prepaid',
          username: this.config.username,
          sign: sign,
        }),
      });

      const data = await response.json();
      
      console.log("Raw Digiflazz API response:", JSON.stringify(data).substring(0, 1000));
      
      if (data.result === false) {
        throw new Error(data.message || 'Failed to fetch products');
      }

      return data.data || [];
    } catch (error) {
      console.error('Error fetching Digiflazz products:', error);
      throw error;
    }
  }

  async createTransaction(
    buyerSkuCode: string, 
    customerNo: string, 
    refId: string
  ): Promise<DigiflazzTransactionResponse> {
    try {
      const sign = this.generateSignature(this.config.username, this.config.apiKey, refId);

      const requestData: DigiflazzTransactionRequest = {
        username: this.config.username,
        buyer_sku_code: buyerSkuCode,
        customer_no: customerNo,
        ref_id: refId,
        sign: sign,
      };

      const response = await fetch(`${this.baseUrl}/transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      
      if (data.result === false) {
        throw new Error(data.message || 'Transaction failed');
      }

      return data;
    } catch (error) {
      console.error('Error creating Digiflazz transaction:', error);
      throw error;
    }
  }

  async checkTransactionStatus(refId: string): Promise<DigiflazzTransactionResponse> {
    try {
      const sign = this.generateSignature(this.config.username, this.config.apiKey, refId);

      const response = await fetch(`${this.baseUrl}/transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.config.username,
          buyer_sku_code: '',
          customer_no: '',
          ref_id: refId,
          sign: sign,
        }),
      });

      const data = await response.json();
      
      if (data.result === false) {
        throw new Error(data.message || 'Failed to check transaction status');
      }

      return data;
    } catch (error) {
      console.error('Error checking Digiflazz transaction status:', error);
      throw error;
    }
  }

  async getBalance(): Promise<number> {
    try {
      const sign = crypto.createHash('md5')
        .update(this.config.username + this.config.apiKey + 'depo')
        .digest('hex');

      const response = await fetch(`${this.baseUrl}/cek-saldo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cmd: 'deposit',
          username: this.config.username,
          sign: sign,
        }),
      });

      const data: DigiflazzBalanceResponse = await response.json();
      
      if (!data.data) {
        throw new Error('Failed to fetch balance');
      }

      return data.data.deposit;
    } catch (error) {
      console.error('Error fetching Digiflazz balance:', error);
      throw error;
    }
  }
}

export const digiflazzService = new DigiflazzService({
  username: process.env.DIGIFLAZZ_USERNAME || process.env.DIGIFLAZZ_USER || "",
  apiKey: process.env.DIGIFLAZZ_API_KEY || process.env.DIGIFLAZZ_KEY || "",
  productionMode: process.env.NODE_ENV === "production",
});

// Check if credentials are available
export const isDigiflazzConfigured = () => {
  const username = process.env.DIGIFLAZZ_USERNAME || process.env.DIGIFLAZZ_USER || "";
  const apiKey = process.env.DIGIFLAZZ_API_KEY || process.env.DIGIFLAZZ_KEY || "";
  return username !== "" && apiKey !== "";
};
