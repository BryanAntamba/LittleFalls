// Importación de decorador Injectable para inyección de dependencias
import { Injectable } from '@angular/core';
// Importación de Router para navegación programática entre rutas
import { Router } from '@angular/router';

// Decorador que marca esta clase como servicio inyectable
// providedIn: 'root' = singleton global en toda la aplicación
@Injectable({
    providedIn: 'root'
})
export class AuthService {
    // URL base del endpoint de autenticación en el backend
    private apiUrl = 'http://localhost:3000/api/auth';

    // Constructor con inyección de dependencia de Router
    // Router permite redirigir al usuario programáticamente
    constructor(private router: Router) { }

    /**
     * Inicia sesión de usuario con credenciales
     * Guarda tokens JWT y datos de usuario en localStorage
     * @param correo - Email del usuario
     * @param password - Contraseña del usuario
     * @returns Promise con respuesta del servidor (tokens y datos de usuario)
     */
    async login(correo: string, password: string): Promise<any> {
        try {
            // Petición HTTP POST al endpoint de login
            const response = await fetch(`${this.apiUrl}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Convierte objeto a JSON string para enviar en el body
                body: JSON.stringify({ correo, password })
            });

            // Parsea la respuesta JSON del servidor
            const data = await response.json();

            // Si el login fue exitoso
            if (data.success) {
                // Guardar access token (token de corta duración para peticiones)
                localStorage.setItem('accessToken', data.accessToken);
                // Guardar refresh token (token de larga duración para renovar access token)
                localStorage.setItem('refreshToken', data.refreshToken);
                // Guardar datos del usuario como JSON string
                localStorage.setItem('usuario', JSON.stringify(data.usuario));
            }

            // Retorna la respuesta completa (success, mensaje, tokens, usuario)
            return data;
        } catch (error) {
            // Captura errores de red o del servidor
            return { success: false, mensaje: 'Error de conexión' };
        }
    }

    /**
     * Obtiene el access token del almacenamiento local
     * @returns Access token o null si no existe
     */
    getAccessToken(): string | null {
        return localStorage.getItem('accessToken');
    }

    /**
     * Obtiene el refresh token del almacenamiento local
     * @returns Refresh token o null si no existe
     */
    getRefreshToken(): string | null {
        return localStorage.getItem('refreshToken');
    }

    /**
     * Renueva el access token usando el refresh token
     * Se ejecuta automáticamente cuando el access token expira (401)
     * @returns true si se renovó exitosamente, false si falló
     */
    async refreshAccessToken(): Promise<boolean> {
        try {
            // Obtiene el refresh token del almacenamiento
            const refreshToken = this.getRefreshToken();
            
            // Si no hay refresh token, no se puede renovar
            if (!refreshToken) {
                return false;
            }

            // Petición al endpoint de refresh con el refresh token
            const response = await fetch(`${this.apiUrl}/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });

            const data = await response.json();

            // Si la renovación fue exitosa
            if (data.success) {
                // Guarda el nuevo access token
                localStorage.setItem('accessToken', data.accessToken);
                return true;
            }

            return false;
        } catch (error) {
            console.error('Error al refrescar token:', error);
            return false;
        }
    }

    /**
     * Realiza peticiones HTTP autenticadas con manejo automático de tokens
     * Si el token expira (401), intenta renovarlo automáticamente
     * @param url - URL del endpoint a consultar
     * @param options - Opciones de la petición fetch (method, body, etc.)
     * @returns Promise<Response> - Respuesta HTTP
     */
    async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
        // Obtiene el access token actual
        const accessToken = this.getAccessToken();

        // Si no hay token, lanza error
        if (!accessToken) {
            throw new Error('No hay token de autenticación');
        }

        // Construye los headers combinando los existentes con el token
        // Spread operator (...) combina propiedades de objetos
        const headers = {
            ...options.headers, // Headers que vengan en las opciones
            'Authorization': `Bearer ${accessToken}`, // Header de autenticación JWT
            'Content-Type': 'application/json'
        };

        // Realiza la petición HTTP con los headers autenticados
        // Spread operator combina opciones existentes con headers modificados
        const response = await fetch(url, { ...options, headers });

        // Si recibe código 401 (Unauthorized), el token expiró
        if (response.status === 401) {
            // Intenta renovar el access token
            const refreshed = await this.refreshAccessToken();
            
            // Si se renovó exitosamente
            if (refreshed) {
                // Obtiene el nuevo token
                const newToken = this.getAccessToken();
                // Actualiza el header con el nuevo token
                headers['Authorization'] = `Bearer ${newToken}`;
                // Reintenta la petición original con el nuevo token
                return fetch(url, { ...options, headers });
            } else {
                // Si no se pudo renovar, cierra sesión
                this.logout();
                throw new Error('Sesión expirada');
            }
        }

        // Retorna la respuesta si no hubo problemas de autenticación
        return response;
    }

    /**
     * Registra un nuevo usuario paciente en el sistema
     * @param nombre - Nombre del usuario
     * @param apellido - Apellido del usuario
     * @param edad - Edad del usuario (debe ser >= 18)
     * @param correo - Email del usuario
     * @param password - Contraseña (mínimo 8 caracteres, letras y números)
     * @returns Promise con respuesta del servidor
     */
    async registro(nombre: string, apellido: string, edad: number, correo: string, password: string): Promise<any> {
        try {
            const response = await fetch(`${this.apiUrl}/registro`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Envía todos los datos del registro
                body: JSON.stringify({ nombre, apellido, edad, correo, password })
            });

            return await response.json();
        } catch (error) {
            return { success: false, mensaje: 'Error de conexión' };
        }
    }

    /**
     * Obtiene los datos del usuario actualmente logueado
     * @returns Objeto con datos del usuario o null si no hay sesión
     */
    getUsuario() {
        // Obtiene el string JSON del usuario
        const usuario = localStorage.getItem('usuario');
        // Si existe, lo parsea de JSON a objeto JavaScript
        // Operador ternario: condición ? valor_si_true : valor_si_false
        return usuario ? JSON.parse(usuario) : null;
    }

    /**
     * Verifica si hay un usuario logueado
     * @returns true si hay sesión activa, false si no
     */
    isLoggedIn(): boolean {
        // Retorna true solo si existen ambos: token Y datos de usuario
        // !== null verifica que no sea null
        return this.getAccessToken() !== null && this.getUsuario() !== null;
    }

    /**
     * Verifica si el usuario tiene un rol específico
     * @param role - Rol a verificar ('admin', 'veterinario', 'paciente')
     * @returns true si el usuario tiene ese rol
     */
    hasRole(role: string): boolean {
        const usuario = this.getUsuario();
        // Operador && (AND): retorna true solo si ambas condiciones son verdaderas
        // 1. usuario existe (truthiness check)
        // 2. usuario.tipoUsuario es igual al rol buscado
        return usuario && usuario.tipoUsuario === role;
    }

    /**
     * Verifica si el usuario tiene alguno de los roles permitidos
     * Útil para páginas accesibles por múltiples roles
     * @param roles - Array de roles permitidos
     * @returns true si el usuario tiene alguno de los roles
     */
    hasAnyRole(roles: string[]): boolean {
        const usuario = this.getUsuario();
        // includes() verifica si el array contiene el elemento
        return usuario && roles.includes(usuario.tipoUsuario);
    }

    /**
     * Obtiene el rol del usuario actualmente logueado
     * @returns String con el rol o null si no hay sesión
     */
    getUserRole(): string | null {
        const usuario = this.getUsuario();
        // Operador ternario para retornar el rol o null
        return usuario ? usuario.tipoUsuario : null;
    }

    /**
     * Redirige al usuario a su dashboard correspondiente según su rol
     * Cada tipo de usuario tiene una página de inicio diferente
     * @param tipoUsuario - Opcional: tipo de usuario para redirección
     */
    redirectToDashboard(tipoUsuario?: string) {
        // Usa el parámetro si existe, sino obtiene el rol del usuario actual
        // Operador || (OR): retorna el primer valor truthy
        const tipo = tipoUsuario || this.getUserRole();

        // Switch para determinar la ruta según el rol
        switch (tipo) {
            case 'admin':
                // Administradores van a gestión de usuarios
                this.router.navigate(['/GestionUsuarios-Admin']);
                break;
            case 'veterinario':
                // Veterinarios van a gestión de citas
                this.router.navigate(['/GestionCitas-Veterinario']);
                break;
            case 'paciente':
                // Pacientes van a la página principal
                this.router.navigate(['/home']);
                break;
            default:
                // Si no tiene rol o es desconocido, va al login
                this.router.navigate(['/']);
        }
    }

    /**
     * Cierra la sesión del usuario
     * Elimina todos los datos de sesión y redirige al login
     */
    logout() {
        // Elimina los datos del usuario del localStorage
        localStorage.removeItem('usuario');
        // Elimina el access token
        localStorage.removeItem('accessToken');
        // Elimina el refresh token
        localStorage.removeItem('refreshToken');
        // Redirige al usuario a la página de login
        this.router.navigate(['/Login-LittleFalls']);
    }
}