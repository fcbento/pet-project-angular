import { HttpRequest, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export const authMocks = {
  login: (_req: HttpRequest<unknown>) =>
    of(
      new HttpResponse({
        status: 200,
        body: {
          access_token: 'mocked_access_token_1234567890',
        },
      }),
    ).pipe(delay(environment.mockDelay)),

  register: (_req: HttpRequest<unknown>) =>
    of(
      new HttpResponse({
        status: 200,
        body: {
          message: 'User registered successfully',
        },
      }),
    ).pipe(delay(environment.mockDelay)),
};
