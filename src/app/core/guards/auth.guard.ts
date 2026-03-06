import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { SessionService } from '../services/session.service';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {

    constructor(private sessionService: SessionService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        // 1. Extraer sessionId de varias fuentes por si Angular y el Hash / Path router se cruzan
        let sessionIdFromUrl = route.queryParamMap.get('sessionId');

        if (!sessionIdFromUrl && typeof window !== 'undefined') {
            const searchParams = new URLSearchParams(window.location.search);
            sessionIdFromUrl = searchParams.get('sessionId');

            if (!sessionIdFromUrl && window.location.hash.includes('sessionId=')) {
                try {
                    const hashParts = window.location.hash.split('?');
                    if (hashParts.length > 1) {
                        const hashParams = new URLSearchParams(hashParts[1]);
                        sessionIdFromUrl = hashParams.get('sessionId');
                    }
                } catch (e) { }
            }
        }

        // 2. Si ya hay sesión válida, refrescar si aplica y limpiar la URL
        if (this.sessionService.isAuthenticated()) {
            this.cleanUpUrlSessionId();
            return this.sessionService.refreshTokenIfExpiring().pipe(
                map(() => true),
                catchError(() => {
                    this.sessionService.clearSession();
                    return of(false);
                })
            );
        }

        // 3. Buscar la sesión en local storage o forzar validación del token recuperado de la URL
        const sessionIdFromStorage = this.sessionService.getSessionId();
        const sessionId = sessionIdFromUrl || sessionIdFromStorage;

        if (sessionId) {
            return this.sessionService.fetchSessionData(sessionId).pipe(
                switchMap(() => {
                    if (this.sessionService.isAuthenticated()) {
                        this.cleanUpUrlSessionId();
                        return this.sessionService.refreshTokenIfExpiring().pipe(map(() => true));
                    }
                    this.sessionService.clearSession();
                    return of(false);
                }),
                catchError(() => {
                    this.sessionService.clearSession();
                    return of(false);
                })
            );
        }

        // 4. No hay forma de autenticar
        this.sessionService.clearSession();
        return of(false);
    }

    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return this.canActivate(childRoute, state);
    }

    private cleanUpUrlSessionId(): void {
        if (typeof window !== 'undefined' && window.history) {
            try {
                const url = new URL(window.location.href);
                let urlChanged = false;

                if (url.searchParams.has('sessionId')) {
                    url.searchParams.delete('sessionId');
                    urlChanged = true;
                }

                if (url.hash.includes('sessionId=')) {
                    const hashParts = url.hash.split('?');
                    if (hashParts.length > 1) {
                        const hashParams = new URLSearchParams(hashParts[1]);
                        if (hashParams.has('sessionId')) {
                            hashParams.delete('sessionId');
                            const newHashQuery = hashParams.toString();
                            url.hash = newHashQuery ? `${hashParts[0]}?${newHashQuery}` : hashParts[0];
                            urlChanged = true;
                        }
                    }
                }

                if (urlChanged) {
                    window.history.replaceState({}, document.title, url.toString());
                }
            } catch (error) {
                // Si la URL principal falla en su conversión, no rompemos el proceso visual del guard
            }
        }
    }
}