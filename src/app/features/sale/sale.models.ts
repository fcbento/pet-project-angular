export interface SaleItemRequest {
  productId: number;
  quantity: number;
}

export interface SaleRequest {
  origem: string;
  sellDate: string;
  items: SaleItemRequest[];
}

export interface SaleItemResponse {
  productId: number;
  productName: string;
  quantity: number;
  sellPrice: number;
  profit: number;
  profitMargin: number;
}

export interface SaleResponse {
  id: number;
  origem: string;
  createdAt: string;
  sellDate: string;
  items: SaleItemResponse[];
  totalPrice: number;
  totalProfit: number;
  profitMargin: number;
}

export interface SalesReportResponse {
  totalSell: number;
  totalPrice: number;
  totalProfit: number;
  profitMargin: number;
}
