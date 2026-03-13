import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../utility/models/api-response.interface';
import { LoginModel, LoginResponse, RegisterModel } from '../auth/auth.models';

@Injectable()
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  public login(payload: LoginModel): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.apiUrl}/auth/login`, payload);
  }

  public register(payload: RegisterModel): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/register`, payload);
  }
}
