// Importación de inject para inyección de dependencias funcional
import { inject } from '@angular/core';
// Router para navegación y ActivatedRouteSnapshot para acceder a query params
import { Router, ActivatedRouteSnapshot } from '@angular/router';

/**
 * Guard para proteger la ruta de verificación de código
 * Valida que se haya proporcionado un correo válido en los query parameters
 * Previene acceso directo sin parámetros necesarios
 * 
 * Flujo:
 * 1. Usuario ingresa correo en registro o recuperación
 * 2. Sistema envía código al correo
 * 3. Redirige a /VerificarCodigo?correo=xxx&tipo=xxx
 * 4. Este guard valida que los parámetros sean correctos
 * 
 * @param route - Snapshot con query params (correo, tipo)
 * @returns true si los parámetros son válidos, false si no
 */
export const verifyCodeGuard = (route: ActivatedRouteSnapshot) => {
    // Inyectar Router para redirecciones
    const router = inject(Router);

    // Extraer el parámetro 'correo' de los query params
    // Ejemplo URL: /VerificarCodigo?correo=user@example.com&tipo=registro
    const correo = route.queryParams['correo'];

    // Validar que el correo exista y no esté vacío
    // trim() elimina espacios en blanco al inicio y final
    if (!correo || correo.trim() === '') {
        // Determinar a dónde redirigir según el tipo de verificación
        const tipo = route.queryParams['tipo'];

        // Si es recuperación de contraseña, volver a recuperación
        if (tipo === 'recuperacion') {
            router.navigate(['/RecuperacionPasword']);
        } else {
            // Si es registro u otro, volver a registro
            router.navigate(['/Registro-LittleFalls']);
        }

        return false; // Bloquear acceso a verificación sin correo
    }

    // Validar formato básico del correo con expresión regular
    // Patrón: algo@algo.algo
    // ^ = inicio, $ = final, [^\s@]+ = uno o más caracteres que no sean espacio ni @
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // test() ejecuta la regex y retorna true si coincide
    if (!emailRegex.test(correo)) {
        // Si el formato es inválido, redirigir al login
        router.navigate(['/Login-LittleFalls']);
        return false; // Bloquear acceso con correo mal formado
    }

    // Si todas las validaciones pasaron, permitir acceso
    return true;
};
