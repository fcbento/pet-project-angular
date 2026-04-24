export interface ProductRequest {
  name: string;
  categoryId: number;
  criadoPor: string;
  costPrice: number;
  sellPrice: number;
  hasResale: boolean;
}

export interface ProductModel {
  nome: string;
  categoryId: string;
  hasResale: boolean;
}
