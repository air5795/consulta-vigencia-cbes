import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';

// PrimeNG Modules
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { InputMaskModule } from 'primeng/inputmask';

import { AseguradoService, Asegurado } from './services/asegurado.service';

@Component({
    selector: 'app-verificacion-asegurado',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        SelectModule,
        InputTextModule,
        ButtonModule,
        ToastModule,
        MessageModule,
        CardModule,
        ProgressSpinnerModule,
        DividerModule,
        TagModule,
        InputMaskModule
    ],
    templateUrl: './verificacion-asegurado.component.html',
    styleUrls: ['./verificacion-asegurado.component.scss'],
    providers: [MessageService]
})
export class VerificacionAsegurado implements OnInit {
    consultaForm!: FormGroup;
    tiposBusqueda: any[] = [];
    isLoading = false;
    aseguradoData: Asegurado | null = null;
    fechaConsulta: string | null = null;

    constructor(
        private fb: FormBuilder,
        private aseguradoService: AseguradoService,
        private messageService: MessageService
    ) { }

    ngOnInit(): void {
        this.tiposBusqueda = [
            { label: 'Carnet de Identidad', value: 'ci' },
            { label: 'Matrícula', value: 'matricula' }
        ];

        this.consultaForm = this.fb.group({
            tipoBusqueda: ['ci', Validators.required],
            valor: ['', [Validators.required, Validators.minLength(4)]]
        });

        // Limpia el input valor y la máscara cuando el usuario cambia el tipo de búsqueda
        this.consultaForm.get('tipoBusqueda')?.valueChanges.subscribe(() => {
            this.consultaForm.get('valor')?.reset('');
            this.aseguradoData = null;
        });
    }

    consultar(): void {
        if (this.consultaForm.invalid) {
            this.consultaForm.markAllAsTouched();
            return;
        }

        const tipo = this.consultaForm.get('tipoBusqueda')?.value;
        const valorOriginal = this.consultaForm.get('valor')?.value || '';
        const valor = valorOriginal.toString().toUpperCase();

        this.isLoading = true;
        this.aseguradoData = null;
        this.fechaConsulta = null;

        this.aseguradoService.consultar(tipo, valor).subscribe({
            next: (response) => {
                this.isLoading = false;
                if (!response || !response.asegurado) {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se encontraron datos para la búsqueda' });
                    return;
                }

                this.aseguradoData = response.asegurado;
                this.fechaConsulta = response.fechaConsulta;
                this.messageService.add({ severity: 'success', summary: 'Consulta Exitosa', detail: 'Datos del asegurado recuperados válidamente' });
            },
            error: (err) => {
                this.isLoading = false;
                console.error(err);
                const errorMsg = err.error?.message || 'Ocurrió un error al consultar el servicio. Verifique los datos o su conexión.';
                this.messageService.add({ severity: 'error', summary: 'Error de Consulta', detail: errorMsg });
            }
        });
    }

    limpiar(): void {
        this.consultaForm.reset({
            tipoBusqueda: 'ci',
            valor: ''
        });
        this.aseguradoData = null;
        this.fechaConsulta = null;
    }

    calcularEdad(fechaNacimiento: string | undefined): number | null {
        if (!fechaNacimiento) return null;

        // Intentar parsear DD/MM/YYYY
        let parts = fechaNacimiento.split('/');
        let birthDate: Date;

        if (parts.length === 3) {
            birthDate = new Date(+parts[2], +parts[1] - 1, +parts[0]);
        } else {
            // Formato alternativo (ISO)
            birthDate = new Date(fechaNacimiento);
        }

        if (isNaN(birthDate.getTime())) return null;

        const hoy = new Date();
        let edad = hoy.getFullYear() - birthDate.getFullYear();
        const mes = hoy.getMonth() - birthDate.getMonth();

        if (mes < 0 || (mes === 0 && hoy.getDate() < birthDate.getDate())) {
            edad--;
        }

        return edad;
    }

    // Helper para facilitar el acceso a los controles en el HTML
    get f() {
        return this.consultaForm.controls;
    }
}
