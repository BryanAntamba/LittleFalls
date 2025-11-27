const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateLogin, validateRegistro, sanitizeInput } = require('../middlewares/validators/authValidator');

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
 * @desc    Verificar sesión activa (preparado para JWT)
 * @access  Private
 */
router.get('/verify', 
    authController.verificarSesion
);

module.exports = router;

