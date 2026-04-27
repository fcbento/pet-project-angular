import { CategoryResponse } from '../../category/list/list.models';

export interface ProductResponse {
  id: number;
  name: string;
  category: CategoryResponse;
  criadoPor: string;
  createdAt: string;
  costPrice: number;
  sellPrice: number;
  ifoodSellPrice: number;
  profit: number;
  marketplaceFee: number;
  hasResale: boolean;
  resalePrice: number;
  resaleQuantity: number;
}
