const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passwordRecoveryController = require('../controllers/passwordRecoveryController');
const { validateLogin, validateRegistro, sanitizeInput } = require('../middlewares/validators/authValidator');
const { verificarToken } = require('../middlewares/jwtMiddleware');

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión
 * @access  Public
 */
router.post('/login', 
    sanitizeInput,
    validateLogin,
    authController.login
);

/**
 * @route   POST /api/auth/registro
 * @desc    Registrar nuevo usuario (solo pacientes)
 * @access  Public
 */
router.post('/registro', 
    sanitizeInput,
    validateRegistro,
    authController.registro
);

/**
 * @route   POST /api/auth/verificar-codigo
 * @desc    Verificar código de verificación
 * @access  Public
 */
router.post('/verificar-codigo',
    authController.verificarCodigo
);

/**
 * @route   POST /api/auth/reenviar-codigo
 * @desc    Reenviar código de verificación
 * @access  Public
 */
router.post('/reenviar-codigo',
    authController.reenviarCodigo
);

/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión (preparado para JWT)
 * @access  Private
 */
router.post('/logout', 
    authController.logout
);

/**
 * @route   GET /api/auth/verify
 * @desc    Verificar sesión activa (ahora con JWT)
 * @access  Private
 */
router.get('/verify', 
    verificarToken,
    authController.verificarSesion
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refrescar access token
 * @access  Public (pero requiere refresh token válido)
 */
router.post('/refresh',
    authController.refrescarToken
);

/**
 * RUTAS DE RECUPERACIÓN DE CONTRASEÑA
 */

/**
 * @route   POST /api/auth/recuperar-password/solicitar
 * @desc    Solicitar código de recuperación de contraseña
 * @access  Public
 */
router.post('/recuperar-password/solicitar',
    sanitizeInput,
    passwordRecoveryController.solicitarRecuperacion
);

/**
 * @route   POST /api/auth/recuperar-password/verificar-codigo
 * @desc    Verificar código de recuperación
 * @access  Public
 */
router.post('/recuperar-password/verificar-codigo',
    sanitizeInput,
    passwordRecoveryController.verificarCodigo
);

/**
 * @route   POST /api/auth/recuperar-password/restablecer
 * @desc    Restablecer contraseña con código verificado
 * @access  Public
 */
router.post('/recuperar-password/restablecer',
    sanitizeInput,
    passwordRecoveryController.restablecerPassword
);

module.exports = router;

