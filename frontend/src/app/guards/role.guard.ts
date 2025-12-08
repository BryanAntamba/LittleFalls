// Importación de inject para inyección de dependencias funcional
import { inject } from '@angular/core';
// Router para navegación y ActivatedRouteSnapshot para acceder a datos de la ruta
import { Router, ActivatedRouteSnapshot } from '@angular/router';
// Servicio de autenticación para verificar usuario y roles
import { AuthService } from '../services/auth.service';

/**
 * Guard de control de acceso basado en roles
 * Protege rutas que solo pueden acceder ciertos tipos de usuarios
 * Verifica que el usuario tenga uno de los roles permitidos
 * 
 * Uso en rutas:
 * { 
 *   path: 'admin', 
 *   component: AdminComponent, 
 *   canActivate: [roleGuard],
 *   data: { roles: ['admin'] } // Roles permitidos
 * }
 * 
 * @param route - Snapshot de la ruta activada con datos de configuración
 * @returns true si el usuario tiene rol permitido, false si no
 */
export const roleGuard = (route: ActivatedRouteSnapshot) => {
  // Inyectar el servicio de autenticación
  const authService = inject(AuthService);
  // Inyectar el Router para redirecciones
  const router = inject(Router);

  // Obtener los datos del usuario actual desde localStorage
  const usuario = authService.getUsuario();

  // Si no hay usuario logueado, redirigir al login
  if (!usuario) {
    router.navigate(['/Login-LittleFalls']);
    return false; // Bloquear acceso
  }

  // Extraer los roles permitidos desde los datos de la ruta
  // route.data es un objeto con datos de configuración de la ruta
  // 'roles' debe estar definido en la configuración de la ruta
  const rolesPermitidos = route.data['roles'] as Array<string>;

  // Verificar si el rol del usuario está en la lista de roles permitidos
  // includes() retorna true si el array contiene el elemento
  if (rolesPermitidos && rolesPermitidos.includes(usuario.tipoUsuario)) {
    return true; // Permitir acceso - el usuario tiene un rol válido
  }

  // Si el usuario no tiene permiso, redirigirlo a su dashboard correspondiente
  // Cada tipo de usuario tiene una página de inicio diferente
  authService.redirectToDashboard(usuario.tipoUsuario);
  return false; // Bloquear acceso a esta ruta
};
