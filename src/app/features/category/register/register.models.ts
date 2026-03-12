export interface CategoriaModel {
  id?: number;
  nome: string;
}

export interface CategoryRequest {
  nome: string;
  criadoPor: string;
}
