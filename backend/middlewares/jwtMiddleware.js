// Importar servicio JWT que contiene lógica de verificación de tokens
const jwtService = require('../services/jwtService');

/**
 * Middleware principal para verificar tokens JWT en peticiones protegidas
 * Se ejecuta antes de procesar la petición en rutas que requieren autenticación
 * Extrae el token del header Authorization y valida su autenticidad
 * @param {Object} req - Request con header Authorization
 * @param {Object} res - Response para enviar errores
 * @param {Function} next - Continuar al siguiente middleware si token es válido
 */
const verificarToken = (req, res, next) => {
    try {
        // ========== OBTENER TOKEN DEL HEADER ==========
        // Obtener header de autorización de la petición HTTP
        // req.headers.authorization contiene: "Bearer eyJhbGciOiJIUzI1NiIs..."
        const authHeader = req.headers.authorization;

        // Validar que el header exista
        if (!authHeader) {
            // Retornar 401 Unauthorized si no hay token
            return res.status(401).json({
                success: false,
                mensaje: 'No se proporcionó token de autenticación'
            });
        }

        // ========== EXTRAER TOKEN ==========
        // El formato esperado es: "Bearer TOKEN"
        // Dividir el string por espacios para separar "Bearer" del token
        const parts = authHeader.split(' ');

        // Validar formato: debe tener exactamente 2 partes y empezar con "Bearer"
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({
                success: false,
                mensaje: 'Formato de token inválido. Use: Bearer [token]'
            });
        }

        // Extraer el token (segunda parte después de "Bearer")
        const token = parts[1];

        // ========== VERIFICAR TOKEN ==========
        // Llamar al servicio JWT para verificar firma y expiración
        // decoded contiene los datos del payload si el token es válido
        // decoded será null si el token es inválido o expiró
        const decoded = jwtService.verificarAccessToken(token);

        // Si el token no es válido, rechazar la petición
        if (!decoded) {
            return res.status(401).json({
                success: false,
                mensaje: 'Token inválido o expirado',
                tokenExpirado: true  // Flag para que frontend redirija a login
            });
        }

        // ========== AGREGAR DATOS AL REQUEST ==========
        // Adjuntar información del usuario decodificada al objeto req
        // Esto permite que los controladores accedan a req.usuario
        req.usuario = {
            id: decoded.id,                      // ID del usuario en MongoDB
            correo: decoded.correo,              // Email del usuario
            tipoUsuario: decoded.tipoUsuario     // Rol: paciente, veterinario, admin
        };

        // ========== CONTINUAR AL SIGUIENTE MIDDLEWARE ==========
        // Token válido, permitir que la petición continúe
        next();

    } catch (error) {
        // ========== MANEJO DE ERRORES ==========
        // Capturar cualquier error inesperado durante la verificación
        console.error('Error en middleware de verificación:', error);
        return res.status(500).json({
            success: false,
            mensaje: 'Error al verificar token'
        });
    }
};

/**
 * Middleware para verificar roles específicos del usuario
 * Debe usarse DESPUÉS de verificarToken (requiere req.usuario)
 * Factory function: retorna un middleware configurado con roles permitidos
 * @param {...string} rolesPermitidos - Lista de roles con acceso (ej: 'admin', 'veterinario')
 * @returns {Function} Middleware que verifica el rol del usuario
 */
const verificarRol = (...rolesPermitidos) => {
    // ========== RETORNAR MIDDLEWARE ==========
    // Esta función retorna otra función (closure)
    // Permite pasar parámetros al middleware de forma dinámica
    return (req, res, next) => {
        // ========== VERIFICAR AUTENTICACIÓN ==========
        // Validar que existe req.usuario (agregado por verificarToken)
        if (!req.usuario) {
            // Si no hay usuario, significa que verificarToken no se ejecutó
            return res.status(401).json({
                success: false,
                mensaje: 'Usuario no autenticado'
            });
        }

        // ========== VERIFICAR ROL ==========
        // Verificar si el rol del usuario está en la lista de roles permitidos
        // includes() busca el tipoUsuario en el array rolesPermitidos
        if (!rolesPermitidos.includes(req.usuario.tipoUsuario)) {
            // Retornar 403 Forbidden si el usuario no tiene permiso
            return res.status(403).json({
                success: false,
                mensaje: 'No tienes permisos para acceder a este recurso',
                rolRequerido: rolesPermitidos,          // Qué roles se necesitan
                rolActual: req.usuario.tipoUsuario      // Qué rol tiene el usuario
            });
        }

        // ========== CONTINUAR ==========
        // Usuario tiene el rol correcto, permitir acceso
        next();
    };
};

/**
 * Middleware opcional para rutas que pueden ser públicas o privadas
 * No falla si no hay token, pero agrega req.usuario si existe
 * Útil para funcionalidades con contenido diferente según autenticación
 * @param {Object} req - Request
 * @param {Object} res - Response
 * @param {Function} next - Siguiente middleware
 */
const tokenOpcional = (req, res, next) => {
    try {
        // ========== INTENTAR OBTENER TOKEN ==========
        const authHeader = req.headers.authorization;

        // Si hay header de autorización, intentar extraer el token
        if (authHeader) {
            const parts = authHeader.split(' ');
            // Validar formato correcto
            if (parts.length === 2 && parts[0] === 'Bearer') {
                const token = parts[1];
                // Intentar verificar token
                const decoded = jwtService.verificarAccessToken(token);

                // Si el token es válido, agregar usuario al request
                if (decoded) {
                    req.usuario = {
                        id: decoded.id,
                        correo: decoded.correo,
                        tipoUsuario: decoded.tipoUsuario
                    };
                }
            }
        }
        
        // ========== CONTINUAR SIEMPRE ==========
        // Continuar independientemente de si hay token o no
        // La ruta puede verificar si req.usuario existe para dar contenido personalizado
        next();
    } catch (error) {
        // En caso de error, simplemente continuar sin usuario
        // No bloqueamos la petición en token opcional
        next();
    }
};

// ========== EXPORTACIONES ==========
// Exportar los tres middlewares para usar en las rutas
module.exports = {
    verificarToken,     // Requiere token válido (obligatorio)
    verificarRol,       // Verifica rol específico (usar después de verificarToken)
    tokenOpcional       // Token opcional (no bloquea si falta)
};
