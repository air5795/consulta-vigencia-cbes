// app.config.ts
import { provideHttpClient, withFetch, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';

// Importa tu interceptor usando la ruta relativa donde lo hayas creado (Ajsuta este path si lo copiaste en otro lado)
import { AuthInterceptor } from './app/core/interceptor/auth.interceptor';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(appRoutes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }), withEnabledBlockingInitialNavigation()),

        // --- CAMBIOS PARA SEGURIDAD (HTTP) ---
        // Se añade withInterceptorsFromDi() para permitir interceptores clásicos basados en Clases
        provideHttpClient(withFetch(), withInterceptorsFromDi()),

        // Se provee tu AuthInterceptor de la misma forma que en app.module antiguo
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        },
        // -------------------------------------

        provideZonelessChangeDetection(),
        providePrimeNG({ theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } } })
    ]
};
