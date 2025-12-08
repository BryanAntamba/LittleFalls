// Importación de la función inject para inyección de dependencias funcional
import { inject } from '@angular/core';
// Importación de Router para navegación programática
import { Router } from '@angular/router';
// Importación del servicio de autenticación
import { AuthService } from '../services/auth.service';

/**
 * Guard de autenticación funcional
 * Protege rutas que requieren que el usuario esté logueado
 * Si el usuario no está autenticado, lo redirige al login
 * 
 * Uso en rutas:
 * { path: 'ruta-protegida', component: MiComponente, canActivate: [authGuard] }
 * 
 * @returns true si el usuario está logueado, false si no
 */
export const authGuard = () => {
  // Inyectar el servicio de autenticación usando inject()
  // inject() es la forma funcional de inyección de dependencias en Angular
  const authService = inject(AuthService);
  
  // Inyectar el Router para redireccionar si es necesario
  const router = inject(Router);

  // Verificar si el usuario tiene sesión activa
  // isLoggedIn() verifica que existan token y datos de usuario
  if (authService.isLoggedIn()) {
    return true; // Permitir acceso a la ruta
  }

  // Si no está logueado, redirigir a la página de login
  router.navigate(['/Login-LittleFalls']);
  return false; // Bloquear acceso a la ruta
};
