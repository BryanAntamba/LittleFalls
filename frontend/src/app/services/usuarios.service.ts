import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class UsuariosService {
    private apiUrl = 'http://localhost:3000/api/usuarios';

    constructor(private authService: AuthService) { }

    // Obtener todos los usuarios (con JWT)
    async obtenerTodos(): Promise<any> {
        try {
            console.log('UsuariosService: Llamando a', this.apiUrl);
            
            const response = await this.authService.fetchWithAuth(this.apiUrl, {
                method: 'GET'
            });
            
            console.log('UsuariosService: Response status:', response.status);
            
            const data = await response.json();
            console.log('UsuariosService: Data recibida:', data);
            
            return data;
        } catch (error: any) {
            console.error('UsuariosService: Error:', error);
            return { success: false, mensaje: 'Error de conexión: ' + error.message };
        }
    }

    // Obtener usuarios por tipo (con JWT)
    async obtenerPorTipo(tipo: string): Promise<any> {
        try {
            const response = await this.authService.fetchWithAuth(`${this.apiUrl}/tipo/${tipo}`, {
                method: 'GET'
            });
            return await response.json();
        } catch (error) {
            return { success: false, mensaje: 'Error de conexión' };
        }
    }

    // Crear nuevo usuario (con JWT)
    async crear(datos: any): Promise<any> {
        try {
            const response = await this.authService.fetchWithAuth(this.apiUrl, {
                method: 'POST',
                body: JSON.stringify(datos)
            });
            return await response.json();
        } catch (error) {
            return { success: false, mensaje: 'Error de conexión' };
        }
    }

    // Actualizar usuario (con JWT)
    async actualizar(id: string, datos: any): Promise<any> {
        try {
            const response = await this.authService.fetchWithAuth(`${this.apiUrl}/${id}`, {
                method: 'PUT',
                body: JSON.stringify(datos)
            });
            return await response.json();
        } catch (error) {
            return { success: false, mensaje: 'Error de conexión' };
        }
    }

    // Cambiar estado (con JWT)
    async cambiarEstado(id: string): Promise<any> {
        try {
            const response = await this.authService.fetchWithAuth(`${this.apiUrl}/${id}/estado`, {
                method: 'PATCH'
            });
            return await response.json();
        } catch (error) {
            return { success: false, mensaje: 'Error de conexión' };
        }
    }

    // Eliminar usuario (con JWT)
    async eliminar(id: string): Promise<any> {
        try {
            const response = await this.authService.fetchWithAuth(`${this.apiUrl}/${id}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            return { success: false, mensaje: 'Error de conexión' };
        }
    }
}
