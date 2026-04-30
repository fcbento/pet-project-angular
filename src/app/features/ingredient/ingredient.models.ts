export interface IngredientRequest {
  name: string;
  unit: string;
  unitPrice: number;
}

export interface IngredientResponse {
  id: number;
  name: string;
  unit: string;
  unitPrice: number;
}
