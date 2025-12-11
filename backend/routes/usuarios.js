// ========== IMPORTACIONES ==========
// Importar Express para crear enrutador
const express = require('express');
// Crear instancia del enrutador para gestión de usuarios
const router = express.Router();

// Importar controlador con lógica de negocio de usuarios
const usuarioController = require('../controllers/usuarioController');
// Importar middlewares de validación para usuarios
const { validarCreacionUsuario, validarActualizacionUsuario } = require('../middlewares/validators/usuarioValidator');
// Importar middlewares de autenticación y autorización
const { verificarToken, verificarRol } = require('../middlewares/jwtMiddleware');

// ========== MIDDLEWARE GLOBAL ==========
// TODAS las rutas de usuarios requieren autenticación
// No hay rutas públicas en este módulo (gestión administrativa)
router.use(verificarToken);

// ========== RUTAS DE GESTIÓN DE USUARIOS (solo admin) ==========

// GET /api/usuarios
// Obtener listado completo de todos los usuarios del sistema
// Incluye: veterinarios, admin, pacientes
// Acceso: solo administradores
router.get('/', 
    verificarRol('admin'),  // Verifica que el usuario sea admin
    usuarioController.obtenerTodos.bind(usuarioController)
);

// GET /api/usuarios/tipo/:tipo
// Obtener usuarios filtrados por tipo específico
// :tipo puede ser: 'veterinario', 'admin', 'paciente'
// Acceso: solo administradores
router.get('/tipo/:tipo', 
    verificarRol('admin'),
    usuarioController.obtenerPorTipo.bind(usuarioController)
);

// POST /api/usuarios
// Crear un nuevo usuario (veterinario o admin)
// Los pacientes se registran por /api/auth/registro
// Acceso: solo administradores
router.post('/', 
    verificarRol('admin'),
    validarCreacionUsuario,  // Valida nombre, apellido, correo, password, etc.
    usuarioController.crear.bind(usuarioController)
);

// PUT /api/usuarios/:id
// Actualizar información completa de un usuario
// PUT = actualización completa (enviar todos los campos)
// :id = ID del usuario a actualizar
// Acceso: solo administradores
router.put('/:id', 
    verificarRol('admin'),
    validarActualizacionUsuario,  // Valida campos a actualizar
    usuarioController.actualizar.bind(usuarioController)
);

// PATCH /api/usuarios/:id/estado
// Cambiar estado de usuario (activar/desactivar)
// PATCH = actualización parcial (solo el campo activo)
// Útil para suspender cuentas sin eliminarlas
// Acceso: solo administradores
router.patch('/:id/estado', 
    verificarRol('admin'),
    usuarioController.cambiarEstado.bind(usuarioController)
);

// DELETE /api/usuarios/:id
// Eliminar permanentemente un usuario del sistema
// Operación irreversible - usar con precaución
// Acceso: solo administradores
router.delete('/:id', 
    verificarRol('admin'),
    usuarioController.eliminar.bind(usuarioController)
);

// ========== EXPORTACIÓN ==========
// Exportar router para usar en index.js
// Se importa como: app.use('/api/usuarios', usuariosRoutes)
module.exports = router;
