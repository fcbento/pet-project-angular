import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PurchaseRequest {
  purchaseDate: string;
  quantity: number;
  totalPrice: number;
  type: string; // CMV, OPEX, PRO_LABORE, OUTROS
  subType?: string;
}

export interface PurchaseResponse {
  id: number;
  purchaseDate: string;
  quantity: number;
  totalPrice: number;
  type: string;
  subType?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/management/purchases`;

  public findAll(start: string, end: string): Observable<PurchaseResponse[]> {
    const params = new HttpParams().set('start', start).set('end', end);
    return this.http.get<PurchaseResponse[]>(this.apiUrl, { params });
  }

  public create(request: PurchaseRequest): Observable<PurchaseResponse> {
    return this.http.post<PurchaseResponse>(this.apiUrl, request);
  }

  public update(id: number, request: PurchaseRequest): Observable<PurchaseResponse> {
    return this.http.put<PurchaseResponse>(`${this.apiUrl}/${id}`, request);
  }

  public delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
