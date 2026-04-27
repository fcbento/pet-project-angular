export interface IngredientDTO {
  name: string;
  quantity: number;
  unit: string;
  value: number;
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
  ingredients: IngredientDTO[];
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
