import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TechnicalSheetRequest, TechnicalSheetResponse } from './technical-sheet.models';

@Injectable({
  providedIn: 'root',
})
export class TechnicalSheetService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/technical-sheets`;

  public save(request: TechnicalSheetRequest): Observable<TechnicalSheetResponse> {
    return this.http.post<TechnicalSheetResponse>(this.apiUrl, request);
  }

  public getByProductId(productId: number): Observable<TechnicalSheetResponse> {
    return this.http.get<TechnicalSheetResponse>(`${this.apiUrl}/product/${productId}`);
  }
}
