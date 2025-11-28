import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:3000/api/auth';

    constructor(private router: Router) { }

    // Login
    async login(correo: string, password: string): Promise<any> {
        try {
            const response = await fetch(`${this.apiUrl}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo, password })
            });

            const data = await response.json();

            if (data.success) {
                // Guardar usuario en localStorage
                localStorage.setItem('usuario', JSON.stringify(data.usuario));
            }

            return data;
        } catch (error) {
            return { success: false, mensaje: 'Error de conexión' };
        }
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
        return this.getUsuario() !== null;
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
        this.router.navigate(['/Login-LittleFalls']);
    }
}
