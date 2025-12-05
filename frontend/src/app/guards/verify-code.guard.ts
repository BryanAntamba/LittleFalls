import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';

/**
 * Guard para proteger la ruta de verificar código
 * Valida que se haya proporcionado un correo en los query params
 */
export const verifyCodeGuard = (route: ActivatedRouteSnapshot) => {
    const router = inject(Router);

    // Verificar que venga el parámetro de correo
    const correo = route.queryParams['correo'];

    if (!correo || correo.trim() === '') {
        // Si no hay correo, redirigir según el tipo
        const tipo = route.queryParams['tipo'];

        if (tipo === 'recuperacion') {
            router.navigate(['/RecuperacionPasword']);
        } else {
            router.navigate(['/Registro-LittleFalls']);
        }

        return false;
    }

    // Validar formato básico de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
        router.navigate(['/Login-LittleFalls']);
        return false;
    }

    return true;
};
