// ========== IMPORTACIONES ==========
// Importar express para crear el enrutador
const express = require('express');
// Crear instancia del enrutador de Express
// router se usa para definir rutas específicas de autenticación
const router = express.Router();

// Importar controlador de autenticación (login, registro, verificación)
const authController = require('../controllers/authController');
// Importar controlador de recuperación de contraseña
const passwordRecoveryController = require('../controllers/passwordRecoveryController');

// Importar middlewares de validación desde authValidator
// Desestructuración: extrae funciones específicas del módulo
const { validateLogin, validateRegistro, sanitizeInput } = require('../middlewares/validators/authValidator');
// Importar middleware de verificación de tokens JWT
const { verificarToken } = require('../middlewares/jwtMiddleware');

// ========== RUTAS DE AUTENTICACIÓN PRINCIPAL ==========

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión en el sistema
 * @access  Public (no requiere autenticación previa)
 */
// router.post() define una ruta que acepta peticiones POST
router.post('/login', 
    sanitizeInput,      // 1. Limpia y sanitiza los datos de entrada (previene inyecciones)
    validateLogin,      // 2. Valida formato de correo y que password exista
    authController.login // 3. Procesa el login y genera tokens JWT
);

/**
 * @route   POST /api/auth/registro
 * @desc    Registrar nuevo usuario (solo pacientes)
 * @access  Public (cualquiera puede registrarse como paciente)
 */
router.post('/registro', 
    sanitizeInput,          // 1. Limpia datos para prevenir XSS
    validateRegistro,       // 2. Valida todos los campos del registro
    authController.registro // 3. Crea usuario y envía código de verificación
);

// ========== RUTAS DE VERIFICACIÓN DE CUENTA ==========

/**
 * @route   POST /api/auth/verificar-codigo
 * @desc    Verificar código de verificación enviado por email
 * @access  Public
 */
router.post('/verificar-codigo',
    authController.verificarCodigo // Valida código de 6 dígitos y activa cuenta
);

/**
 * @route   POST /api/auth/reenviar-codigo
 * @desc    Reenviar código de verificación si expiró
 * @access  Public
 */
router.post('/reenviar-codigo',
    authController.reenviarCodigo // Genera nuevo código y lo envía por email
);

// ========== RUTAS DE SESIÓN ==========

/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión del usuario
 * @access  Private (requiere estar autenticado)
 */
router.post('/logout', 
    authController.logout // Por ahora solo confirma logout (JWT es stateless)
);

/**
 * @route   GET /api/auth/verify
 * @desc    Verificar si la sesión actual es válida
 * @access  Private (requiere token JWT válido)
 */
router.get('/verify', 
    verificarToken,                  // 1. Verifica que el token JWT sea válido
    authController.verificarSesion   // 2. Retorna datos del usuario autenticado
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refrescar access token usando refresh token
 * @access  Public (pero requiere refresh token válido en el body)
 */
router.post('/refresh',
    authController.refrescarToken // Genera nuevo access token si refresh token es válido
);

// ========== RUTAS DE RECUPERACIÓN DE CONTRASEÑA ==========

/**
 * @route   POST /api/auth/recuperar-password/solicitar
 * @desc    Solicitar código de recuperación de contraseña
 * @access  Public (cualquiera puede solicitar recuperación)
 */
router.post('/recuperar-password/solicitar',
    sanitizeInput,                                  // Limpia datos de entrada
    passwordRecoveryController.solicitarRecuperacion // Genera código y envía email
);

/**
 * @route   POST /api/auth/recuperar-password/verificar-codigo
 * @desc    Verificar código de recuperación recibido por email
 * @access  Public
 */
router.post('/recuperar-password/verificar-codigo',
    sanitizeInput,                              // Limpia datos de entrada
    passwordRecoveryController.verificarCodigo  // Valida código de 6 dígitos
);

/**
 * @route   POST /api/auth/recuperar-password/restablecer
 * @desc    Restablecer contraseña usando código verificado
 * @access  Public
 */
router.post('/recuperar-password/restablecer',
    sanitizeInput,                                    // Limpia datos de entrada
    passwordRecoveryController.restablecerPassword    // Actualiza password y envía confirmación
);

// ========== EXPORTACIÓN ==========
// Exportar router para que index.js pueda usar estas rutas
// Se importará como: app.use('/api/auth', authRoutes)
module.exports = router;

