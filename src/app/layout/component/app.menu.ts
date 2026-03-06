import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { SessionService } from '../../core/services/session.service';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        @for (item of model; track item.label) {
            @if (!item.separator) {
                <li app-menuitem [item]="item" [root]="true"></li>
            } @else {
                <li class="menu-separator"></li>
            }
        }
    </ul> `,
})
export class AppMenu {
    model: MenuItem[] = [];
    sessionService = inject(SessionService);

    ngOnInit() {
        this.sessionService.sessionData$.subscribe((sessionData) => {
            if (sessionData) {
                this.buildMenu(sessionData.menus);
            }
        });
    }

    buildMenu(menusOriginal: any[]) {
        if (!menusOriginal || menusOriginal.length === 0) {
            // Menú base por defecto si no vienen menús del backend
            this.model = [
                {
                    label: 'Inicio',
                    items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }]
                }
            ];
            return;
        }

        // 1. Ordenar los ítems por su campo "orden" si existe
        menusOriginal.sort((a: any, b: any) => (a.orden || 0) - (b.orden || 0));

        // 2. Agrupar por categoría
        const categoriesMap = new Map<string, any[]>();

        menusOriginal.forEach((menu: any) => {
            const cat = menu.categoria || 'Generales'; // Fallback a 'Generales' si la categoría es null

            if (!categoriesMap.has(cat)) {
                categoriesMap.set(cat, []);
            }

            categoriesMap.get(cat)!.push({
                label: menu.nombre,
                icon: menu.icono || 'pi pi-circle', // Ícono por defecto
                routerLink: [menu.ruta]
            });
        });

        // 3. Crear el formato del menú de PrimeNG (Sakai template)
        this.model = [];
        categoriesMap.forEach((items, categoryName) => {
            this.model.push({
                label: categoryName,
                items: items
            });
        });
    }
}
