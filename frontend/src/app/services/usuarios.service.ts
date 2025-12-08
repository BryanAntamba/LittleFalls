// Importación del decorador Injectable para inyección de dependencias
import { Injectable } from '@angular/core';
// Importación del servicio de autenticación para peticiones autenticadas
import { AuthService } from './auth.service';

// Decorador que marca esta clase como servicio inyectable
// providedIn: 'root' = singleton global compartido en toda la app
@Injectable({
    providedIn: 'root'
})
export class UsuariosService {
    // URL base del endpoint de usuarios en el backend
    private apiUrl = 'http://localhost:3000/api/usuarios';

    // Constructor con inyección de dependencia del AuthService
    // AuthService maneja la autenticación JWT y peticiones autenticadas
    constructor(private authService: AuthService) { }

    /**
     * Obtiene la lista de todos los usuarios del sistema
     * Solo disponible para administradores (verificación en backend)
     * @returns Promise con array de usuarios o error
     */
    async obtenerTodos(): Promise<any> {
        try {
            // Log para debugging - muestra la URL que se está consultando
            console.log('UsuariosService: Llamando a', this.apiUrl);
            
            // Usa fetchWithAuth para hacer petición autenticada con JWT
            // Si el token expira, AuthService lo renueva automáticamente
            const response = await this.authService.fetchWithAuth(this.apiUrl, {
                method: 'GET' // Método HTTP GET para obtener datos
            });
            
            // Log del código de estado HTTP (200, 404, 500, etc.)
            console.log('UsuariosService: Response status:', response.status);
            
            // Parsea la respuesta JSON del servidor
            const data = await response.json();
            // Log de los datos recibidos para debugging
            console.log('UsuariosService: Data recibida:', data);
            
            return data;
        } catch (error: any) {
            // Captura errores de red, servidor o timeout
            console.error('UsuariosService: Error:', error);
            // Retorna objeto de error con mensaje descriptivo
            return { success: false, mensaje: 'Error de conexión: ' + error.message };
        }
    }

    /**
     * Obtiene usuarios filtrados por tipo
     * Permite separar pacientes, veterinarios y administradores
     * @param tipo - Tipo de usuario ('paciente', 'veterinario', 'admin')
     * @returns Promise con array de usuarios del tipo especificado
     */
    async obtenerPorTipo(tipo: string): Promise<any> {
        try {
            // Petición GET con filtro de tipo en la URL
            const response = await this.authService.fetchWithAuth(`${this.apiUrl}/tipo/${tipo}`, {
                method: 'GET'
            });
            return await response.json();
        } catch (error) {
            return { success: false, mensaje: 'Error de conexión' };
        }
    }

    /**
     * Crea un nuevo usuario en el sistema
     * Solo administradores pueden crear usuarios veterinarios o admins
     * @param datos - Objeto con datos del usuario (nombre, apellido, edad, correo, password, tipoUsuario)
     * @returns Promise con respuesta del servidor
     */
    async crear(datos: any): Promise<any> {
        try {
            // Petición POST autenticada con datos del usuario en el body
            const response = await this.authService.fetchWithAuth(this.apiUrl, {
                method: 'POST',
                // El AuthService ya incluye Content-Type y Authorization
                body: JSON.stringify(datos) // Convierte objeto a JSON string
            });
            return await response.json();
        } catch (error) {
            return { success: false, mensaje: 'Error de conexión' };
        }
    }

    /**
     * Actualiza los datos de un usuario existente
     * Los usuarios pueden actualizar sus propios datos
     * Los admins pueden actualizar cualquier usuario
     * @param id - ID del usuario a actualizar
     * @param datos - Objeto con datos a actualizar (parcial o completo)
     * @returns Promise con respuesta del servidor
     */
    async actualizar(id: string, datos: any): Promise<any> {
        try {
            // Petición PUT a la URL con el ID del usuario
            // PUT es para actualizaciones completas o parciales
            const response = await this.authService.fetchWithAuth(`${this.apiUrl}/${id}`, {
                method: 'PUT',
                body: JSON.stringify(datos)
            });
            return await response.json();
        } catch (error) {
            return { success: false, mensaje: 'Error de conexión' };
        }
    }

    /**
     * Cambia el estado activo/inactivo de un usuario
     * Solo administradores pueden cambiar estados
     * Usuarios inactivos no pueden iniciar sesión
     * Toggle: activo ↔ inactivo
     * @param id - ID del usuario
     * @returns Promise con respuesta del servidor
     */
    async cambiarEstado(id: string): Promise<any> {
        try {
            // Petición PATCH para actualización parcial (solo estado)
            const response = await this.authService.fetchWithAuth(`${this.apiUrl}/${id}/estado`, {
                method: 'PATCH' // PATCH = modificación parcial
            });
            return await response.json();
        } catch (error) {
            return { success: false, mensaje: 'Error de conexión' };
        }
    }

    /**
     * Elimina permanentemente un usuario del sistema
     * Solo administradores pueden eliminar usuarios
     * Acción irreversible - se pierde toda la información
     * @param id - ID del usuario a eliminar
     * @returns Promise con respuesta del servidor
     */
    async eliminar(id: string): Promise<any> {
        try {
            // Petición DELETE con el ID del usuario en la URL
            const response = await this.authService.fetchWithAuth(`${this.apiUrl}/${id}`, {
                method: 'DELETE' // DELETE = eliminación permanente
            });
            return await response.json();
        } catch (error) {
            return { success: false, mensaje: 'Error de conexión' };
        }
    }
}

