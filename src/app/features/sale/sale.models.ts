export interface SaleItemRequest {
  productId: number;
  quantity: number;
  isPromotional?: boolean;
}

export type SaleOrigin = 'IFOOD' | 'CONDOMINIO' | 'ESCOLA' | 'OUTROS' | 'REVENDA';

export interface SaleRequest {
  origem: SaleOrigin;
  sellDate: string;
  items: SaleItemRequest[];
  packagingFee?: number;
}

export interface SaleItemResponse {
  productId: number;
  productName: string;
  quantity: number;
  sellPrice: number;
  profit: number;
  profitMargin: number;
  isPromotional?: boolean;
  originalPrice?: number;
  comboItems?: { productId: number, productName: string, quantity: number }[];
}

export interface SaleResponse {
  id: number;
  origem: SaleOrigin;
  createdAt: string;
  sellDate: string;
  items: SaleItemResponse[];
  totalPrice: number;
  totalProfit: number;
  profitMargin: number;
  totalCmv: number;
  packagingFee?: number;
  directCmv: number;
  fixedCost: number;
}

export interface SalesReportResponse {
  totalSell: number;
  totalPrice: number;
  totalProfit: number;
  profitMargin: number;
}
