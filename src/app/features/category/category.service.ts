import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../utility/models/api-response.interface';
import { CategoryResponse } from './list/list.models';
import { CategoryRequest } from './register/register.models';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  public create({ nome, criadoPor }: CategoryRequest): Observable<ApiResponse<CategoryResponse>> {
    return this.http.post<ApiResponse<CategoryResponse>>(`${this.apiUrl}/categoria`, {
      nome,
      criadoPor,
    });
  }

  public getAll(): Observable<ApiResponse<CategoryResponse[]>> {
    return this.http.get<ApiResponse<CategoryResponse[]>>(`${this.apiUrl}/categoria`);
  }

  public delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/categoria/${id}`);
  }
}
