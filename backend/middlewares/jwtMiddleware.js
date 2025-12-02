const jwtService = require('../services/jwtService');

/**
 * Middleware para verificar JWT en las peticiones
 */
const verificarToken = (req, res, next) => {
    try {
        // Obtener token del header Authorization
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                mensaje: 'No se proporcionó token de autenticación'
            });
        }

        // El formato esperado es: "Bearer TOKEN"
        const parts = authHeader.split(' ');

        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({
                success: false,
                mensaje: 'Formato de token inválido. Use: Bearer [token]'
            });
        }

        const token = parts[1];

        // Verificar el token
        const decoded = jwtService.verificarAccessToken(token);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                mensaje: 'Token inválido o expirado',
                tokenExpirado: true
            });
        }

        // Agregar información del usuario al request
        req.usuario = {
            id: decoded.id,
            correo: decoded.correo,
            tipoUsuario: decoded.tipoUsuario
        };

        next();

    } catch (error) {
        console.error('Error en middleware de verificación:', error);
        return res.status(500).json({
            success: false,
            mensaje: 'Error al verificar token'
        });
    }
};

/**
 * Middleware para verificar roles específicos
 * Debe usarse DESPUÉS de verificarToken
 */
const verificarRol = (...rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.usuario) {
            return res.status(401).json({
                success: false,
                mensaje: 'Usuario no autenticado'
            });
        }

        if (!rolesPermitidos.includes(req.usuario.tipoUsuario)) {
            return res.status(403).json({
                success: false,
                mensaje: 'No tienes permisos para acceder a este recurso',
                rolRequerido: rolesPermitidos,
                rolActual: req.usuario.tipoUsuario
            });
        }

        next();
    };
};

/**
 * Middleware opcional - No falla si no hay token
 * Útil para rutas que pueden ser públicas o privadas
 */
const tokenOpcional = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader) {
            const parts = authHeader.split(' ');
            if (parts.length === 2 && parts[0] === 'Bearer') {
                const token = parts[1];
                const decoded = jwtService.verificarAccessToken(token);

                if (decoded) {
                    req.usuario = {
                        id: decoded.id,
                        correo: decoded.correo,
                        tipoUsuario: decoded.tipoUsuario
                    };
                }
            }
        }

        next();
    } catch (error) {
        // En caso de error, simplemente continuar sin usuario
        next();
    }
};

module.exports = {
    verificarToken,
    verificarRol,
    tokenOpcional
};
