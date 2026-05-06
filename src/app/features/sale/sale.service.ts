import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../utility/models/api-response.interface';
import { SaleRequest, SaleResponse, SalesReportResponse } from './sale.models';

@Injectable({ providedIn: 'root' })
export class SaleService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/venda`;

  public create(payload: SaleRequest): Observable<ApiResponse<SaleResponse>> {
    return this.http.post<ApiResponse<SaleResponse>>(this.baseUrl, payload);
  }

  public getAll(): Observable<ApiResponse<SaleResponse[]>> {
    return this.http.get<ApiResponse<SaleResponse[]>>(this.baseUrl);
  }

  public getById(id: number): Observable<ApiResponse<SaleResponse>> {
    return this.http.get<ApiResponse<SaleResponse>>(`${this.baseUrl}/${id}`);
  }

  public delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  public deleteAll(): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(this.baseUrl);
  }

  public getReport(start: string, end: string): Observable<ApiResponse<SalesReportResponse>> {
    return this.http.get<ApiResponse<SalesReportResponse>>(`${this.baseUrl}/relatorio`, {
      params: { start, end },
    });
  }
}
