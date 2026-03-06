// app.routes.ts
import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';

// Importa el Guard desde donde hayas pegado la carpeta
import { AuthGuard } from './app/core/guards/auth.guard';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        canActivate: [AuthGuard], // <-- AÑADE EL GUARD AQUÍ (Protege todo el bloque layout)
        children: [
            { path: '', redirectTo: 'inicio/verificacion-asegurado', pathMatch: 'full' },
            { path: 'dashboard', component: Dashboard },
            { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
            { path: 'documentation', component: Documentation },
            { path: 'inicio', loadChildren: () => import('./app/pages/pages.routes') }
        ]
    },

    // RUTAS PÚBLICAS (Se dejan AFUERA para que el AuthGuard no las bloquee)
    { path: 'landing', component: Landing },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];

