import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CitasService {
    private apiUrl = 'http://localhost:3000/api/citas';

    constructor() { }

    private getHeaders(): HeadersInit {
        const token = localStorage.getItem('accessToken');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    }

    async crearCita(datos: any): Promise<any> {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(datos)
            });
            return await response.json();
        } catch (error) {
            return { success: false, mensaje: 'Error de conexión' };
        }
    }

    async obtenerTodasCitas(): Promise<any> {
        try {
            const response = await fetch(this.apiUrl, {
                headers: this.getHeaders()
            });
            return await response.json();
        } catch (error) {
            return { success: false, mensaje: 'Error de conexión' };
        }
    }

    async obtenerCitasPorPaciente(pacienteId: string): Promise<any> {
        try {
            const response = await fetch(`${this.apiUrl}/paciente/${pacienteId}`, {
                headers: this.getHeaders()
            });
            return await response.json();
        } catch (error) {
            return { success: false, mensaje: 'Error de conexión' };
        }
    }

    async obtenerCitasPorVeterinario(veterinarioId: string): Promise<any> {
        try {
            const response = await fetch(`${this.apiUrl}/veterinario/${veterinarioId}`, {
                headers: this.getHeaders()
            });
            return await response.json();
        } catch (error) {
            return { success: false, mensaje: 'Error de conexión' };
        }
    }

    async actualizarEstadoCita(citaId: string, estado: string): Promise<any> {
        try {
            const response = await fetch(`${this.apiUrl}/${citaId}/estado`, {
                method: 'PATCH',
                headers: this.getHeaders(),
                body: JSON.stringify({ estado })
            });
            return await response.json();
        } catch (error) {
            return { success: false, mensaje: 'Error de conexión' };
        }
    }

    async asignarVeterinario(citaId: string, veterinarioId: string): Promise<any> {
        try {
            const response = await fetch(`${this.apiUrl}/${citaId}/asignar`, {
                method: 'PATCH',
                headers: this.getHeaders(),
                body: JSON.stringify({ veterinarioId })
            });
            return await response.json();
        } catch (error) {
            return { success: false, mensaje: 'Error de conexión' };
        }
    }

    async eliminarCita(citaId: string): Promise<any> {
        try {
            const response = await fetch(`${this.apiUrl}/${citaId}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            return await response.json();
        } catch (error) {
            return { success: false, mensaje: 'Error de conexión' };
        }
    }

    private citasData: any[] = [];

    async cargarCitas(): Promise<void> {
        console.log('Servicio - Cargando citas desde API...');
        const resultado = await this.obtenerTodasCitas();
        console.log('Servicio - Resultado de API:', resultado);
        if (resultado.success) {
            this.citasData = resultado.citas;
            console.log('Servicio - Citas almacenadas:', this.citasData.length);
        } else {
            console.error('Servicio - Error al cargar citas:', resultado);
        }
    }

    getCita(indice: number) {
        return this.citasData[indice];
    }

    getCitas() {
        return this.citasData;
    }

    agregarRegistroClinico(indice: number, registro: any) {
        if (this.citasData[indice]) {
            if (!this.citasData[indice].registrosClinicosHistorial) {
                this.citasData[indice].registrosClinicosHistorial = [];
            }
            this.citasData[indice].registrosClinicosHistorial.push(registro);
        }
        return registro;
    }

    actualizarCita(indice: number, datos: any) {
        if (this.citasData[indice]) {
            this.citasData[indice] = { ...this.citasData[indice], ...datos };
        }
    }

    actualizarRegistroClinico(indice: number, registro: any, indiceRegistro?: number) {
        if (this.citasData[indice] && this.citasData[indice].registrosClinicosHistorial) {
            const idx = indiceRegistro !== undefined 
                ? indiceRegistro 
                : this.citasData[indice].registrosClinicosHistorial.length - 1;
            
            if (idx >= 0 && idx < this.citasData[indice].registrosClinicosHistorial.length) {
                this.citasData[indice].registrosClinicosHistorial[idx] = registro;
            }
        }
    }

    eliminarCitaLocal(indice: number) {
        if (indice >= 0 && indice < this.citasData.length) {
            this.citasData.splice(indice, 1);
        }
    }
}
