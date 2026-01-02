import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { mockBuilder } from '../mocks/mock-routes';

export const mockInterceptor: HttpInterceptorFn = (req, next) => {
  if (!environment.useMock) {
    return next(req);
  }
  return mockBuilder(req, next);
};
