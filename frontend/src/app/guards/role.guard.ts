import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const usuario = authService.getUsuario();

  if (!usuario) {
    router.navigate(['/Login-LittleFalls']);
    return false;
  }

  const rolesPermitidos = route.data['roles'] as Array<string>;

  if (rolesPermitidos && rolesPermitidos.includes(usuario.tipoUsuario)) {
    return true;
  }

  // Redirigir al dashboard según el rol del usuario
  authService.redirectToDashboard(usuario.tipoUsuario);
  return false;
};
