// DTO usado no request da ficha técnica (ingredientId + rendimento)
export interface IngredientDTO {
  ingredientId: number;
  yieldQuantity: number;
}

// Response enriquecido de ingrediente na ficha técnica
export interface IngredientSheetItem {
  ingredientId: number;
  ingredientName: string;
  unit: string;
  unitPrice: number;
  yieldQuantity: number;
  subtotal: number;
}

export interface PackagingDTO {
  stickCost: number;
  brandLabelCost: number;
  flavorLabelCost: number;
  bagCost: number;
  paperPackagingCost: number;
  packagingType: 'PAPEL' | 'SAQUINHO';
}

export interface TechnicalSheetRequest {
  productId: number;
  yieldUnits: number;
  yieldWeight: number;
  storage: string;
  validity: string;
  ingredients: IngredientDTO[];
  packaging: PackagingDTO;
  sellPrice: number;
  ifoodSellPrice: number;
  hasResale?: boolean;
  resalePrice?: number;
  resaleQuantity?: number;
}

export interface TechnicalSheetResponse {
  id: number;
  productId: number;
  productName: string;
  yieldUnits: number;
  yieldWeight: number;
  storage: string;
  validity: string;
  ingredients: IngredientSheetItem[];
  packaging: PackagingDTO;
  totalCost: number;
  unitCost: number;
  fixedOperationalCost: number;
  sellPrice?: number;
  ifoodSellPrice?: number;
  hasResale?: boolean;
  resalePrice?: number;
  resaleQuantity?: number;
}
