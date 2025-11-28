const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { validarCreacionUsuario, validarActualizacionUsuario } = require('../middlewares/validators/usuarioValidator');

// Obtener todos los usuarios
router.get('/', usuarioController.obtenerTodos.bind(usuarioController));

// Obtener usuarios por tipo
router.get('/tipo/:tipo', usuarioController.obtenerPorTipo.bind(usuarioController));

// Crear nuevo usuario (con validación)
router.post('/', validarCreacionUsuario, usuarioController.crear.bind(usuarioController));

// Actualizar usuario (con validación)
router.put('/:id', validarActualizacionUsuario, usuarioController.actualizar.bind(usuarioController));

// Cambiar estado de usuario
router.patch('/:id/estado', usuarioController.cambiarEstado.bind(usuarioController));

// Eliminar usuario
router.delete('/:id', usuarioController.eliminar.bind(usuarioController));

module.exports = router;
