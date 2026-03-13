import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { withNgxsStoragePlugin } from '@ngxs/storage-plugin';
import { provideStore } from '@ngxs/store';
import { routes } from './app.routes';
import { mockInterceptor } from './core/interceptors/mock-interceptor';
import { tokenInterceptor } from './core/interceptors/token-interceptor';
import { SessionState } from './utility/store/session/session.state';
import { ToastState } from './utility/store/toast/toast.state';
import { UserState } from './utility/store/user/user.state';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideStore(
      [SessionState, ToastState, UserState],
      withNgxsStoragePlugin({
        keys: '*',
      }),
    ),
    provideHttpClient(withInterceptors([mockInterceptor, tokenInterceptor])),
  ],
};
