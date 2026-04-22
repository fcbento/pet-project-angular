export interface ProductRequest {
  name: string;
  categoryId: number;
  criadoPor: string;
  costPrice: number;
  sellPrice: number;
}

export interface ProductModel {
  nome: string;
  categoryId: string;
  costPrice: number;
  sellPrice: number;
}
