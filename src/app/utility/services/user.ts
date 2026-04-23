import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

import { map } from 'rxjs';
import { ApiResponse } from '../models/api-response.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  public getUser(): Observable<User> {
    return this.http
      .get<ApiResponse<User>>(`${this.apiUrl}/user/me`)
      .pipe(map((response) => response.data));
  }
}
