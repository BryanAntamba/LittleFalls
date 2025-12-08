// Importación de inject para inyección de dependencias funcional
import { inject } from '@angular/core';
// Router para navegación y ActivatedRouteSnapshot para acceder a query params
import { Router, ActivatedRouteSnapshot } from '@angular/router';

/**
 * Guard para proteger la ruta de restablecer contraseña
 * Valida que se hayan proporcionado correo y código de verificación válidos
 * Previene acceso directo sin completar el proceso de verificación
 * 
 * Flujo completo:
 * 1. Usuario solicita recuperación en /RecuperacionPasword
 * 2. Ingresa código en /VerificarCodigo
 * 3. Al verificar correctamente, redirige a /RestablecerPasword?correo=xxx&codigo=xxx
 * 4. Este guard valida que ambos parámetros sean correctos antes de permitir acceso
 * 
 * @param route - Snapshot con query params (correo, codigo)
 * @returns true si correo y código son válidos, false si no
 */
export const resetPasswordGuard = (route: ActivatedRouteSnapshot) => {
    // Inyectar Router para redirecciones
    const router = inject(Router);

    // Extraer parámetros de la URL
    // Ejemplo: /RestablecerPasword?correo=user@mail.com&codigo=123456
    const correo = route.queryParams['correo'];
    const codigo = route.queryParams['codigo'];

    // Validar que ambos parámetros existan
    // Si falta alguno, el usuario no completó el proceso correctamente
    if (!correo || !codigo) {
        // Redirigir al inicio del proceso de recuperación
        router.navigate(['/RecuperacionPasword']);
        return false; // Bloquear acceso sin parámetros completos
    }

    // Validar formato del correo electrónico
    // Expresión regular para formato básico: usuario@dominio.extensión
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
        // Si el formato es inválido, volver a recuperación
        router.navigate(['/RecuperacionPasword']);
        return false; // Bloquear acceso con correo mal formado
    }

    // Validar formato del código de verificación (exactamente 6 dígitos)
    // ^ = inicio, \d = dígito (0-9), {6} = exactamente 6 veces, $ = final
    // ! al inicio niega el resultado: retorna true si NO coincide
    if (!/^\d{6}$/.test(codigo)) {
        // Si el código no tiene formato correcto, volver a recuperación
        router.navigate(['/RecuperacionPasword']);
        return false; // Bloquear acceso con código inválido
    }

    // Si todas las validaciones pasaron, permitir acceso a restablecer contraseña
    return true;
};
