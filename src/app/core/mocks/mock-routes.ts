import { HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { authMocks } from './auth.mock';

type MockHandler = (req: HttpRequest<any>) => Observable<HttpResponse<any>>;

export const mockRoutes: Record<string, MockHandler> = {
  'POST http://localhost:8080/api/auth/login': authMocks.login,
  'POST http://localhost:8080/api/auth/register': authMocks.register,
};

export const mockBuilder: HttpInterceptorFn = (req, next) => {
  const key = `${req.method} ${req.url}`;
  const handler = mockRoutes[key];

  if (handler) {
    console.warn('Running in mock mode [MOCK]', key);
    return handler(req);
  }

  return next(req);
};
