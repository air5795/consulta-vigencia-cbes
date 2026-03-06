import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LayoutService } from '../service/layout.service';
import { SessionService } from '../../core/services/session.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule],
    template: `<div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
            <a class="layout-topbar-logo" routerLink="/inicio">
                <img src="assets/layout/images/logo.png" alt="CBES Logo" style="height: 3rem; width: auto;" class="logo-dark-invert" />
                <img src="assets/layout/images/logo-text.png" alt="Caja Bancaria Estatal de Salud" style="height: 3.3rem; width: auto; " class="logo-dark-invert" />
            </a>
        </div>

        <div class="layout-topbar-actions">
            <!-- Botón dark/light -->
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()" [title]="layoutService.isDarkTheme() ? 'Modo claro' : 'Modo oscuro'">
                    <i class="pi" [class.pi-moon]="layoutService.isDarkTheme()" [class.pi-sun]="!layoutService.isDarkTheme()"></i>
                </button>
            </div>

            <!-- Botón de perfil -->
            <div class="profile-container">
                <button
                    type="button"
                    class="profile-btn"
                    (click)="toggleProfileMenu($event)"
                    [title]="persona ? (persona.nombres + ' ' + persona.primerApellido) : 'Mi perfil'"
                >
                    <!-- Avatar circular siempre visible -->
                    <span style="display:inline-flex;align-items:center;justify-content:center;width:2rem;height:2rem;border-radius:50%;background-color:var(--primary-color);flex-shrink:0;">
                        <i class="pi pi-user" style="font-size:1rem;color:var(--primary-contrast-color);"></i>
                    </span>
                    <!-- Texto solo si hay sesión -->
                    <span *ngIf="persona" style="display:flex;flex-direction:column;align-items:flex-start;line-height:1.2;margin-left:0.25rem;">
                        <span style="font-size:0.8125rem;font-weight:600;color:var(--text-color);white-space:nowrap;">{{ persona.nombres }} {{ persona.primerApellido }} {{ persona.segundoApellido }}</span>
                        <span style="font-size:0.7rem;color:var(--text-color-secondary);white-space:nowrap;">{{ usuario }}</span>
                    </span>
                    <!-- Chevron siempre visible -->
                    <i class="pi pi-angle-down" style="font-size:0.75rem;color:var(--text-color-secondary);margin-left:0.125rem;"></i>
                </button>

                <!-- Menú desplegable -->
                <div class="profile-dropdown" *ngIf="showProfileMenu">
                    <ul>

                        <li>
                            <a (click)="cerrarSession($event)" class="danger">
                                <i class="pi pi-sign-out"></i>
                                <span>Cerrar Sesión</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>`,
    styles: [`
        /* Color para icono de menú */
        .layout-menu-button .pi-bars::before {
            color: #249e80 !important;
        }

        /* Contenedor del perfil */
        .profile-container {
            position: relative;
            display: inline-flex;
            align-items: center;
        }

        /* Botón de perfil - sin clase Sakai para evitar width:2.5rem forzado */
        .profile-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: transparent;
            border: none;
            cursor: pointer;
            border-radius: var(--content-border-radius, 6px);
            padding: 0.375rem 0.625rem;
            height: 2.5rem;
            transition: background-color var(--element-transition-duration, 0.15s);
        }

        .profile-btn:hover {
            background-color: var(--surface-hover);
        }

        /* Menú desplegable */
        .profile-dropdown {
            position: absolute;
            right: 0;
            top: calc(100% + 0.5rem);
            background: var(--surface-card);
            border: 1px solid var(--surface-border);
            border-radius: var(--content-border-radius, 8px);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
            min-width: 220px;
            z-index: 9999;
            overflow: hidden;
        }

        .profile-dropdown-header {
            padding: 0.875rem 1rem 0.75rem;
            border-bottom: 1px solid var(--surface-border);
            display: flex;
            flex-direction: column;
            gap: 0.2rem;
        }

        .profile-dropdown-name {
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--text-color);
        }

        .profile-dropdown-regional {
            font-size: 0.75rem;
            color: var(--text-color-secondary);
        }

        .profile-dropdown ul {
            list-style: none;
            margin: 0;
            padding: 0.25rem 0;
        }

        .profile-dropdown li a {
            display: flex;
            align-items: center;
            gap: 0.625rem;
            padding: 0.625rem 1rem;
            color: var(--text-color);
            text-decoration: none;
            cursor: pointer;
            font-size: 0.875rem;
            transition: background-color var(--element-transition-duration, 0.15s);
        }

        .profile-dropdown li a:hover {
            background-color: var(--surface-hover);
        }

        .profile-dropdown li a.danger {
            color: var(--red-500);
        }

        .profile-dropdown li a.danger:hover {
            background-color: var(--red-50);
        }

        .profile-dropdown li.divider {
            height: 1px;
            background: var(--surface-border);
            margin: 0.25rem 0;
        }

        .profile-dropdown li a i {
            font-size: 0.9375rem;
            width: 1.125rem;
            color: var(--text-color-secondary);
        }

        .profile-dropdown li a.danger i {
            color: var(--red-500);
        }
    `]
})
export class AppTopbar implements OnInit, OnDestroy {
    items!: MenuItem[];
    persona: any = null;
    usuario: string = '';
    regional: string = '';
    showProfileMenu: boolean = false;

    private sessionSubscription?: Subscription;
    private closeMenuHandler?: (e: Event) => void;

    constructor(
        public layoutService: LayoutService,
        private readonly sessionService: SessionService,
        private readonly router: Router,
        private readonly cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.sessionSubscription = this.sessionService.sessionData$.subscribe({
            next: (data) => {
                if (data) {
                    this.usuario = data.usuario || '';
                    this.persona = data.persona ?? null;
                    this.regional = data.rol?.regional?.[0]?.nombre || '';
                    this.cdr.markForCheck();
                }
            },
            error: (error) => {
                console.error('AppTopbar: Error al cargar datos de sesión:', error);
            }
        });

        this.closeMenuHandler = (e: Event) => {
            if (!(e.target as HTMLElement).closest('.profile-container')) {
                this.showProfileMenu = false;
            }
        };
        document.addEventListener('click', this.closeMenuHandler);
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
        // Aplicar la clase inmediatamente sin esperar el effect de Angular
        this.layoutService.toggleDarkMode();
    }

    toggleProfileMenu(event: Event) {
        event.stopPropagation();
        this.showProfileMenu = !this.showProfileMenu;
    }

    navigateToPerfil(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        this.showProfileMenu = false;
        this.router.navigate(['/inicio/perfil-usuario']);
    }

    cerrarSession(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        this.showProfileMenu = false;
        this.sessionService.clearSession();
    }

    ngOnDestroy() {
        if (this.sessionSubscription) {
            this.sessionSubscription.unsubscribe();
        }
        if (this.closeMenuHandler) {
            document.removeEventListener('click', this.closeMenuHandler);
        }
    }
}

