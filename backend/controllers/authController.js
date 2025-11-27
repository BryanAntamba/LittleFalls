const authService = require('../services/authService');

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
     * GET /api/auth/verify (preparado para futuro)
     * Verificar token de sesión
     */
    async verificarSesion(req, res, next) {
        try {
            // TODO: Implementar verificación de JWT
            res.json({ 
                success: true, 
                mensaje: 'Sesión válida' 
            });
        } catch (error) {
            next(error);
        }
    }

}

module.exports = new AuthController();
