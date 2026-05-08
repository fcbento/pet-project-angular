import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../utility/models/api-response.interface';

export interface PromotionRequest {
  productId: number;
  origin: string;
  promoPrice: number;
}

export interface PromotionResponse {
  id: number;
  productId: number;
  productName: string;
  categoryName: string;
  origin: string;
  originalPrice: number;
  promoPrice: number;
  discountPercentage: number;
  status: string;
}

export interface ComboRequest {
  name: string;
  sellPrice: number;
  ifoodSellPrice: number;
  items: { productId: number; quantity: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class PromocoesService {
  private readonly http = inject(HttpClient);
  private readonly promoUrl = `${environment.apiUrl}/promocao`;
  private readonly comboUrl = `${environment.apiUrl}/combo`;

  createPromotion(request: PromotionRequest): Observable<PromotionResponse> {
    return this.http.post<ApiResponse<PromotionResponse>>(this.promoUrl, request).pipe(map(r => r.data));
  }

  listActivePromotions(): Observable<PromotionResponse[]> {
    return this.http.get<ApiResponse<PromotionResponse[]>>(`${this.promoUrl}/ativa`).pipe(map(r => r.data));
  }

  removePromotion(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.promoUrl}/${id}`).pipe(map(() => undefined));
  }

  createCombo(request: ComboRequest): Observable<any> {
    return this.http.post<ApiResponse<any>>(this.comboUrl, request).pipe(map(r => r.data));
  }

  listCombos(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(this.comboUrl).pipe(map(r => r.data));
  }

  deleteCombo(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.comboUrl}/${id}`).pipe(map(() => undefined));
  }

  updateCombo(id: number, request: ComboRequest): Observable<any> {
    return this.http.put<ApiResponse<any>>(`${this.comboUrl}/${id}`, request).pipe(map(r => r.data));
  }
}
