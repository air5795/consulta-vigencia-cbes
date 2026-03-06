import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `<div class="layout-footer">
        CAJA BANCARIA ESTATAL DE SALUD - Todos los derechos reservados {{anio}}
    </div>`
})
export class AppFooter {
    anio = new Date().getFullYear();
}
