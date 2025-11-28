const usuarioService = require('../services/usuarioService');

/**
 * Controller para gestión de usuarios
 */
class UsuarioController {

    /**
     * GET /api/usuarios
     * Obtener todos los usuarios
     */
    async obtenerTodos(req, res, next) {
        try {
            console.log('GET /api/usuarios - Obteniendo todos los usuarios');
            const resultado = await usuarioService.obtenerTodos();

            if (!resultado.success) {
                console.error('Error al obtener usuarios:', resultado);
                return res.status(400).json(resultado);
            }

            console.log(`Usuarios encontrados: ${resultado.usuarios.length}`);
            res.json(resultado);
        } catch (error) {
            console.error('Error en obtenerTodos controller:', error);
            next(error);
        }
    }

    /**
     * GET /api/usuarios/tipo/:tipo
     * Obtener usuarios por tipo (veterinario, admin, paciente)
     */
    async obtenerPorTipo(req, res, next) {
        try {
            const { tipo } = req.params;
            const resultado = await usuarioService.obtenerPorTipo(tipo);

            if (!resultado.success) {
                return res.status(400).json(resultado);
            }

            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/usuarios
     * Crear nuevo usuario (solo admin o veterinario)
     */
    async crear(req, res, next) {
        try {
            const { nombre, apellido, edad, correo, password, tipoUsuario } = req.body;

            const resultado = await usuarioService.crear({
                nombre,
                apellido,
                edad,
                correo,
                password,
                tipoUsuario
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
     * PUT /api/usuarios/:id
     * Actualizar usuario
     */
    async actualizar(req, res, next) {
        try {
            const { id } = req.params;
            const { nombre, apellido, edad, correo, password } = req.body;

            const resultado = await usuarioService.actualizar(id, {
                nombre,
                apellido,
                edad,
                correo,
                password
            });

            if (!resultado.success) {
                return res.status(400).json(resultado);
            }

            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/usuarios/:id/estado
     * Cambiar estado (activar/desactivar)
     */
    async cambiarEstado(req, res, next) {
        try {
            const { id } = req.params;
            const resultado = await usuarioService.cambiarEstado(id);

            if (!resultado.success) {
                return res.status(400).json(resultado);
            }

            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/usuarios/:id
     * Eliminar usuario
     */
    async eliminar(req, res, next) {
        try {
            const { id } = req.params;
            const resultado = await usuarioService.eliminar(id);

            if (!resultado.success) {
                return res.status(400).json(resultado);
            }

            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UsuarioController();
