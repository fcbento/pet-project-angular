import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IngredientRequest, IngredientResponse } from './ingredient.models';

@Injectable({
  providedIn: 'root'
})
export class IngredientService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/ingredients`;

  public findAll(): Observable<IngredientResponse[]> {
    return this.http.get<IngredientResponse[]>(this.apiUrl);
  }

  public create(request: IngredientRequest): Observable<IngredientResponse> {
    return this.http.post<IngredientResponse>(this.apiUrl, request);
  }

  public update(id: number, request: IngredientRequest): Observable<IngredientResponse> {
    return this.http.put<IngredientResponse>(`${this.apiUrl}/${id}`, request);
  }

  public delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  public checkUsage(id: number): Observable<{ inUse: boolean }> {
    return this.http.get<{ inUse: boolean }>(`${this.apiUrl}/${id}/usage`);
  }
}
