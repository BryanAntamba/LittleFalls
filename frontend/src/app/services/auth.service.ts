import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:3000/api/auth';

    constructor(private router: Router) { }

    // Login con JWT
    async login(correo: string, password: string): Promise<any> {
        try {
            const response = await fetch(`${this.apiUrl}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo, password })
            });

            const data = await response.json();

            if (data.success) {
                // Guardar tokens y usuario en localStorage
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);
                localStorage.setItem('usuario', JSON.stringify(data.usuario));
            }

            return data;
        } catch (error) {
            return { success: false, mensaje: 'Error de conexión' };
        }
    }

    // Obtener Access Token
    getAccessToken(): string | null {
        return localStorage.getItem('accessToken');
    }

    // Obtener Refresh Token
    getRefreshToken(): string | null {
        return localStorage.getItem('refreshToken');
    }

    // Refrescar Access Token
    async refreshAccessToken(): Promise<boolean> {
        try {
            const refreshToken = this.getRefreshToken();
            
            if (!refreshToken) {
                return false;
            }

            const response = await fetch(`${this.apiUrl}/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('accessToken', data.accessToken);
                return true;
            }

            return false;
        } catch (error) {
            console.error('Error al refrescar token:', error);
            return false;
        }
    }

    // Hacer petición autenticada con JWT
    async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
        const accessToken = this.getAccessToken();

        if (!accessToken) {
            throw new Error('No hay token de autenticación');
        }

        // Agregar el token al header Authorization
        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        };

        const response = await fetch(url, { ...options, headers });

        // Si el token expiró, intentar refrescar
        if (response.status === 401) {
            const refreshed = await this.refreshAccessToken();
            
            if (refreshed) {
                // Reintentar la petición con el nuevo token
                const newToken = this.getAccessToken();
                headers['Authorization'] = `Bearer ${newToken}`;
                return fetch(url, { ...options, headers });
            } else {
                // Si no se pudo refrescar, cerrar sesión
                this.logout();
                throw new Error('Sesión expirada');
            }
        }

        return response;
    }

    // Registro
    async registro(nombre: string, apellido: string, edad: number, correo: string, password: string): Promise<any> {
        try {
            const response = await fetch(`${this.apiUrl}/registro`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, apellido, edad, correo, password })
            });

            return await response.json();
        } catch (error) {
            return { success: false, mensaje: 'Error de conexión' };
        }
    }

    // Obtener usuario actual
    getUsuario() {
        const usuario = localStorage.getItem('usuario');
        return usuario ? JSON.parse(usuario) : null;
    }

    // Verificar si está logueado
    isLoggedIn(): boolean {
        return this.getAccessToken() !== null && this.getUsuario() !== null;
    }

    // Verificar si el usuario tiene un rol específico
    hasRole(role: string): boolean {
        const usuario = this.getUsuario();
        return usuario && usuario.tipoUsuario === role;
    }

    // Verificar si el usuario tiene alguno de los roles permitidos
    hasAnyRole(roles: string[]): boolean {
        const usuario = this.getUsuario();
        return usuario && roles.includes(usuario.tipoUsuario);
    }

    // Obtener el rol del usuario actual
    getUserRole(): string | null {
        const usuario = this.getUsuario();
        return usuario ? usuario.tipoUsuario : null;
    }

    // Redirigir al dashboard según el rol del usuario
    redirectToDashboard(tipoUsuario?: string) {
        const tipo = tipoUsuario || this.getUserRole();

        switch (tipo) {
            case 'admin':
                this.router.navigate(['/GestionUsuarios-Admin']);
                break;
            case 'veterinario':
                this.router.navigate(['/GestionCitas-Veterinario']);
                break;
            case 'paciente':
                this.router.navigate(['/home']);
                break;
            default:
                this.router.navigate(['/']);
        }
    }

    // Cerrar sesión
    logout() {
        localStorage.removeItem('usuario');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        this.router.navigate(['/Login-LittleFalls']);
    }
}