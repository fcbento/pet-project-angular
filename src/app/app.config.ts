import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { withNgxsStoragePlugin } from '@ngxs/storage-plugin';
import { provideStore } from '@ngxs/store';
import { routes } from './app.routes';
import { mockInterceptor } from './core/interceptors/mock-interceptor';
import { SessionState } from './utility/session/session.state';
import { ToastState } from './utility/toast/toast.state';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideStore(
      [SessionState, ToastState],
      withNgxsStoragePlugin({
        keys: '*',
      }),
    ),
    provideHttpClient(withInterceptors([mockInterceptor])),
  ],
};
