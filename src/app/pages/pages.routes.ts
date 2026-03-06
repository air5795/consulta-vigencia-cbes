import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Crud } from './crud/crud';
import { Empty } from './empty/empty';
import { VerificacionAsegurado } from './modules/verificacion-asegurado/verificacion-asegurado';

export default [
    { path: 'verificacion-asegurado', component: VerificacionAsegurado },
    { path: 'documentation', component: Documentation },
    { path: 'crud', component: Crud },
    { path: 'empty', component: Empty },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
