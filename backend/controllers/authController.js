const authService = require('../services/authService');
const jwtService = require('../services/jwtService');
const Usuario = require('../models/Usuario');

/**
 * Controller para manejo de autenticación
 */
class AuthController {

    /**
     * POST /api/auth/login
     * Iniciar sesión
     */
    async login(req, res, next) {
        try {
            const { correo, password } = req.body;

            const resultado = await authService.login(correo, password);

            if (!resultado.success) {
                return res.status(401).json(resultado);
            }

            res.json(resultado);

        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/auth/registro
     * Registrar nuevo usuario (solo pacientes)
     */
    async registro(req, res, next) {
        try {
            const { nombre, apellido, edad, correo, password } = req.body;

            const resultado = await authService.registro({
                nombre,
                apellido,
                edad,
                correo,
                password
            });

            if (!resultado.success) {
                return res.status(400).json(resultado);
            }

            res.status(201).json(resultado);

        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/auth/logout (preparado para futuro)
     * Cerrar sesión
     */
    async logout(req, res, next) {
        try {
            // TODO: Implementar invalidación de token cuando se use JWT
            res.json({ 
                success: true, 
                mensaje: 'Sesión cerrada exitosamente' 
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/auth/verificar-codigo
     * Verificar código de verificación
     */
    async verificarCodigo(req, res, next) {
        try {
            const { correo, codigo } = req.body;

            if (!correo || !codigo) {
                return res.status(400).json({
                    success: false,
                    mensaje: 'Correo y código son requeridos'
                });
            }

            const resultado = await authService.verificarCodigo(correo, codigo);

            if (!resultado.success) {
                return res.status(400).json(resultado);
            }

            res.json(resultado);

        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/auth/reenviar-codigo
     * Reenviar código de verificación
     */
    async reenviarCodigo(req, res, next) {
        try {
            const { correo } = req.body;

            if (!correo) {
                return res.status(400).json({
                    success: false,
                    mensaje: 'El correo es requerido'
                });
            }

            const resultado = await authService.reenviarCodigo(correo);

            if (!resultado.success) {
                return res.status(400).json(resultado);
            }

            res.json(resultado);

        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/auth/verify
     * Verificar token de sesión (ahora usa JWT)
     */
    async verificarSesion(req, res, next) {
        try {
            // El middleware ya verificó el token y agregó req.usuario
            res.json({ 
                success: true, 
                mensaje: 'Sesión válida',
                usuario: req.usuario
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/auth/refresh
     * Refrescar access token usando refresh token
     */
    async refrescarToken(req, res, next) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({
                    success: false,
                    mensaje: 'Refresh token requerido'
                });
            }

            // Verificar refresh token
            const decoded = jwtService.verificarRefreshToken(refreshToken);

            if (!decoded) {
                return res.status(401).json({
                    success: false,
                    mensaje: 'Refresh token inválido o expirado'
                });
            }

            // Buscar usuario para verificar que siga existiendo y activo
            const usuario = await Usuario.findById(decoded.id);

            if (!usuario || !usuario.activo) {
                return res.status(401).json({
                    success: false,
                    mensaje: 'Usuario no válido'
                });
            }

            // Generar nuevo access token
            const usuarioData = {
                id: usuario._id,
                correo: usuario.correo,
                tipoUsuario: usuario.tipoUsuario
            };

            const nuevoAccessToken = jwtService.generarAccessToken(usuarioData);

            res.json({
                success: true,
                mensaje: 'Token refrescado exitosamente',
                accessToken: nuevoAccessToken
            });

        } catch (error) {
            next(error);
        }
    }

}

module.exports = new AuthController();
