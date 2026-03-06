import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

export interface LoginResponse {
    message: string;
    token: string;
    user: any;
}

export interface Asegurado {
    afi_nro: number;
    ca_nro: number;
    ase_mat_tit: string;
    ase_mat: string;
    ase_ci: string;
    ase_ci_com: string | null;
    ase_ci_ext: string;
    tipo_documento: string;
    ase_apat: string;
    ase_amat: string;
    ase_nom: string;
    ase_fec_nac: string;
    ase_edad: number;
    ase_sexo: string;
    ase_telf: string;
    emp_npatronal: string;
    emp_nom: string;
    ase_tipo: string;
    ase_estado: string;
    ase_cond_est: string;
}

export interface ConsultaResponse {
    asegurado: Asegurado;
    mensaje: string;
    fechaConsulta: string;
}

@Injectable({
    providedIn: 'root'
})
export class AseguradoService {
    private apiUrl = 'https://services.cbes.org.bo/api';
    private token: string | null = null;

    constructor(private http: HttpClient) { }

    private authenticate(): Observable<string> {
        if (this.token) {
            return of(this.token);
        }

        const credentials = {
            username: 'petrolera',
            password: 'P3tr0l3r4'
        };

        return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
            map(response => {
                this.token = response.token;
                return this.token;
            })
        );
    }

    consultar(tipo: 'ci' | 'matricula', valor: string): Observable<ConsultaResponse> {
        return this.authenticate().pipe(
            switchMap(token => {
                const headers = new HttpHeaders({
                    'Authorization': `Bearer ${token}`
                });

                const url = tipo === 'ci'
                    ? `${this.apiUrl}/asegurados-detalle/${valor}`
                    : `${this.apiUrl}/asegurados-detalle/matricula/${valor}`;

                return this.http.get<ConsultaResponse>(url, { headers });
            }),
            catchError(error => {
                // Si el token expira o es inválido, podríamos querer resetearlo
                if (error.status === 401 || error.status === 403) {
                    this.token = null;
                }
                return throwError(() => error);
            })
        );
    }
}
