// Importar servicio de usuarios que contiene la lógica de negocio
const usuarioService = require('../services/usuarioService');

/**
 * Controlador para gestión de usuarios del sistema
 * Maneja peticiones HTTP relacionadas con CRUD de usuarios
 * Incluye funcionalidades para admin, veterinarios y pacientes
 */
class UsuarioController {

    /**
     * Obtener todos los usuarios del sistema (solo admin)
     * GET /api/usuarios
     * @param {Object} req - Request
     * @param {Object} res - Response con array de usuarios
     * @param {Function} next - Middleware de errores
     */
    async obtenerTodos(req, res, next) {
        try {
            // Log para debugging y auditoría
            console.log('GET /api/usuarios - Obteniendo todos los usuarios');
            // Delegar al servicio para obtener usuarios
            const resultado = await usuarioService.obtenerTodos();

            // Validar que la operación fue exitosa
            if (!resultado.success) {
                console.error('Error al obtener usuarios:', resultado);
                return res.status(400).json(resultado);
            }

            // Log de cantidad de usuarios encontrados
            console.log(`Usuarios encontrados: ${resultado.usuarios.length}`);
            // Retornar usuarios al cliente
            res.json(resultado);
        } catch (error) {
            console.error('Error en obtenerTodos controller:', error);
            // Pasar error al middleware de manejo de errores
            next(error);
        }
    }

    /**
     * Obtener usuarios filtrados por tipo
     * GET /api/usuarios/tipo/:tipo
     * Tipos: veterinario, admin, paciente
     * @param {Object} req - Request con tipo en params
     * @param {Object} res - Response con usuarios del tipo especificado
     * @param {Function} next - Middleware de errores
     */
    async obtenerPorTipo(req, res, next) {
        try {
            // Extraer tipo de usuario de los parámetros de la URL
            const { tipo } = req.params;
            // Obtener usuarios del tipo especificado
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
     * Crear un nuevo usuario en el sistema
     * POST /api/usuarios
     * Solo admin o veterinario pueden crear usuarios
     * @param {Object} req - Request con datos del usuario en body
     * @param {Object} res - Response con usuario creado
     * @param {Function} next - Middleware de errores
     */
    async crear(req, res, next) {
        try {
            // Extraer datos del nuevo usuario del body
            const { nombre, apellido, edad, correo, password, tipoUsuario } = req.body;

            // Delegar creación al servicio
            const resultado = await usuarioService.crear({
                nombre,
                apellido,
                edad,
                correo,
                password,
                tipoUsuario
            });

            // Validar resultado
            if (!resultado.success) {
                return res.status(400).json(resultado);
            }

            // Status 201 Created para recursos nuevos
            res.status(201).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Actualizar información de un usuario existente
     * PUT /api/usuarios/:id
     * Permite actualizar nombre, apellido, edad, correo, password
     * @param {Object} req - Request con id en params y datos en body
     * @param {Object} res - Response con usuario actualizado
     * @param {Function} next - Middleware de errores
     */
    async actualizar(req, res, next) {
        try {
            // Extraer ID del usuario a actualizar
            const { id } = req.params;
            // Extraer campos a actualizar del body
            const { nombre, apellido, edad, correo, password } = req.body;

            // Delegar actualización al servicio
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
     * Cambiar estado de un usuario (activar/desactivar)
     * PATCH /api/usuarios/:id/estado
     * Alterna entre activo:true y activo:false
     * Útil para suspender cuentas sin eliminarlas
     * @param {Object} req - Request con id en params
     * @param {Object} res - Response con usuario actualizado
     * @param {Function} next - Middleware de errores
     */
    async cambiarEstado(req, res, next) {
        try {
            const { id } = req.params;
            // Servicio alterna el estado actual automáticamente
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
     * Eliminar un usuario del sistema permanentemente
     * DELETE /api/usuarios/:id
     * Operación irreversible - usar con precaución
     * @param {Object} req - Request con id en params
     * @param {Object} res - Response confirmando eliminación
     * @param {Function} next - Middleware de errores
     */
    async eliminar(req, res, next) {
        try {
            const { id } = req.params;
            // Eliminar usuario de la base de datos
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

// Exportar instancia única del controlador (Singleton)
module.exports = new UsuarioController();
