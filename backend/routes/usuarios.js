const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { validarCreacionUsuario, validarActualizacionUsuario } = require('../middlewares/validators/usuarioValidator');
const { verificarToken, verificarRol } = require('../middlewares/jwtMiddleware');

// TODAS las rutas de usuarios requieren autenticación
router.use(verificarToken);

// Obtener todos los usuarios (solo admin)
router.get('/', 
    verificarRol('admin'),
    usuarioController.obtenerTodos.bind(usuarioController)
);

// Obtener usuarios por tipo (solo admin)
router.get('/tipo/:tipo', 
    verificarRol('admin'),
    usuarioController.obtenerPorTipo.bind(usuarioController)
);

// Crear nuevo usuario (solo admin)
router.post('/', 
    verificarRol('admin'),
    validarCreacionUsuario, 
    usuarioController.crear.bind(usuarioController)
);

// Actualizar usuario (solo admin)
router.put('/:id', 
    verificarRol('admin'),
    validarActualizacionUsuario, 
    usuarioController.actualizar.bind(usuarioController)
);

// Cambiar estado de usuario (solo admin)
router.patch('/:id/estado', 
    verificarRol('admin'),
    usuarioController.cambiarEstado.bind(usuarioController)
);

// Eliminar usuario (solo admin)
router.delete('/:id', 
    verificarRol('admin'),
    usuarioController.eliminar.bind(usuarioController)
);

module.exports = router;
