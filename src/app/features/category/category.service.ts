import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CategoryRequest } from './register/register.models';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  public create({ nome, criadoPor }: CategoryRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/categoria`, {
      nome,
      criadoPor,
    });
  }
}
