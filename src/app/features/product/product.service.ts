import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../utility/models/api-response.interface';
import { ProductResponse } from './list/list.models';
import { ProductRequest } from './register/register.models';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  public create(request: ProductRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/produto`, request);
  }

  public getAll(): Observable<ApiResponse<ProductResponse[]>> {
    return this.http.get<ApiResponse<ProductResponse[]>>(`${this.apiUrl}/produto`);
  }

  public delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/produto/${id}`);
  }
}
