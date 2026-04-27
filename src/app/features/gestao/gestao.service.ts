import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../utility/models/api-response.interface';

export interface ProductMixDTO {
  name: string;
  quantity: number;
  percentage: number;
}

export interface GoalResponse {
  id: number;
  month: number;
  year: number;
  value: number;
}

export interface ManagementResponse {
  totalSales: number;
  totalUnits: number;
  totalRevenue: number;
  totalProfit: number;
  ifoodSales: number;
  counterSales: number;
  resaleSales: number;
  averageTicket: number;
  averageMargin: number;
  breakEvenPoint: number;
  cacIfood: number;
  monthlyGoal: number;
  goalProgress: number;
  growthMoM: number;
  topProducts: ProductMixDTO[];
  totalProLabore: number;
  totalElectricity: number;
  totalGasoline: number;
  isHealthy: boolean;

  // US-014: Módulo de Compras
  totalPurchasesValue: number;
  totalPurchasesCount: number;
  grossProfit: number;
  
  // US-014 Evolução
  totalPurchasesUnits: number;
  inventoryTurnover: number;
  netProfit: number;
}

@Injectable({
  providedIn: 'root',
})
export class GestaoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/venda/resumo-gestao`;
  private readonly goalUrl = `${environment.apiUrl}/metas`;

  public getSummary(start: string, end: string): Observable<ApiResponse<ManagementResponse>> {
    const params = new HttpParams().set('start', start).set('end', end);
    return this.http.get<ApiResponse<ManagementResponse>>(this.apiUrl, { params });
  }

  public saveGoal(month: number, year: number, value: number): Observable<ApiResponse<GoalResponse>> {
    return this.http.post<ApiResponse<GoalResponse>>(this.goalUrl, { month, year, value });
  }
}
