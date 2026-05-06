import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PackagingRequest, PackagingResponse } from './packaging.model';

@Injectable({
  providedIn: 'root'
})
export class PackagingService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/embalagem`;

  findAll(): Observable<PackagingResponse[]> {
    return this.http.get<PackagingResponse[]>(this.apiUrl);
  }

  create(request: PackagingRequest): Observable<PackagingResponse> {
    return this.http.post<PackagingResponse>(this.apiUrl, request);
  }

  update(id: number, request: PackagingRequest): Observable<PackagingResponse> {
    return this.http.put<PackagingResponse>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
