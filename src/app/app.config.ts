import {
  APP_INITIALIZER,
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import { definePreset } from '@primeuix/themes';
import Lara from '@primeuix/themes/lara';
import { credentialsInterceptor } from '@interceptors';
import { AuthService } from '@services';

// Slate-primary preset поверх Lara (белый фон, тёмный акцент)
const StorePreset = definePreset(Lara, {
  semantic: {
    primary: {
      50:  '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
    },
    colorScheme: {
      light: {
        surface: {
          ground: '#f8fafc',
          section: '#f1f5f9',
          card:    '#ffffff',
          overlay: '#ffffff',
          border:  '#e2e8f0',
          hover:   '#f1f5f9',
        },
      },
    },
  },
});

function initializeAppFactory(authService: AuthService) {
  return () => authService.initializeApp();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([credentialsInterceptor])),
    provideRouter(routes),
    providePrimeNG({
      theme: {
        preset: StorePreset,
        options: {
          darkModeSelector: 'none', // тёмная тема отключена
          cssLayer: {
            name: 'primeng',
            order: 'app-styles, primeng',
          },
        },
      },
      zIndex: {
        modal:   1100,
        overlay: 1000,
        menu:    1000,
        tooltip: 1100,
      },
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppFactory,
      deps: [AuthService],
      multi: true,
    },
  ],
};
