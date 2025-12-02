import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';

/**
 * Guard para proteger la ruta de restablecer contraseña
 * Valida que se haya proporcionado correo y código verificado
 */
export const resetPasswordGuard = (route: ActivatedRouteSnapshot) => {
    const router = inject(Router);

    // Verificar que vengan los parámetros necesarios
    const correo = route.queryParams['correo'];
    const codigo = route.queryParams['codigo'];

    if (!correo || !codigo) {
        alert('Sesión inválida. Por favor solicita un nuevo código de recuperación.');
        router.navigate(['/RecuperacionPasword']);
        return false;
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
        alert('Correo inválido');
        router.navigate(['/RecuperacionPasword']);
        return false;
    }

    // Validar formato de código (6 dígitos)
    if (!/^\d{6}$/.test(codigo)) {
        alert('Código inválido. Por favor solicita un nuevo código.');
        router.navigate(['/RecuperacionPasword']);
        return false;
    }

    return true;
};
