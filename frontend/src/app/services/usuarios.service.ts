import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class UsuariosService {
    private apiUrl = 'http://localhost:3000/api/usuarios';

    constructor() { }

    // Obtener todos los usuarios
    async obtenerTodos(): Promise<any> {
        try {
            console.log('UsuariosService: Llamando a', this.apiUrl);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(this.apiUrl, {
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json'
                },
                cache: 'no-cache'
            });
            
            clearTimeout(timeoutId);
            
            console.log('UsuariosService: Response status:', response.status);
            
            const data = await response.json();
            console.log('UsuariosService: Data recibida:', data);
            
            return data;
        } catch (error: any) {
            console.error('UsuariosService: Error:', error);
            
            if (error.name === 'AbortError') {
                return { success: false, mensaje: 'Timeout: El servidor no responde' };
            }
            
            return { success: false, mensaje: 'Error de conexión: ' + error.message };
        }
    }

    // Obtener usuarios por tipo (veterinario, admin, paciente)
    async obtenerPorTipo(tipo: string): Promise<any> {
        try {
            const response = await fetch(`${this.apiUrl}/tipo/${tipo}`);
            return await response.json();
        } catch (error) {
            return { success: false, mensaje: 'Error de conexión' };
        }
    }

    // Crear nuevo usuario
    async crear(datos: any): Promise<any> {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            return await response.json();
        } catch (error) {
            return { success: false, mensaje: 'Error de conexión' };
        }
    }

    // Actualizar usuario
    async actualizar(id: string, datos: any): Promise<any> {
        try {
            const response = await fetch(`${this.apiUrl}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            return await response.json();
        } catch (error) {
            return { success: false, mensaje: 'Error de conexión' };
        }
    }

    // Cambiar estado (activar/desactivar)
    async cambiarEstado(id: string): Promise<any> {
        try {
            const response = await fetch(`${this.apiUrl}/${id}/estado`, {
                method: 'PATCH'
            });
            return await response.json();
        } catch (error) {
            return { success: false, mensaje: 'Error de conexión' };
        }
    }

    // Eliminar usuario
    async eliminar(id: string): Promise<any> {
        try {
            const response = await fetch(`${this.apiUrl}/${id}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            return { success: false, mensaje: 'Error de conexión' };
        }
    }
}
