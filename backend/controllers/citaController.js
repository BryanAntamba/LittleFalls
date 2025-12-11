// Importar el servicio de citas que contiene la lógica de negocio
const citaService = require('../services/citaService');

/**
 * Controlador para gestión de citas veterinarias
 * Maneja las peticiones HTTP y delega la lógica de negocio al CitaService
 * Cada método corresponde a un endpoint de la API REST
 */
class CitaController {

    /**
     * Crear una nueva cita veterinaria
     * POST /api/citas
     * @param {Object} req - Objeto request con los datos de la cita en req.body
     * @param {Object} res - Objeto response para enviar la respuesta
     * @param {Function} next - Middleware para manejo de errores
     */
    async crearCita(req, res, next) {
        try {
            // Delegar creación al servicio pasando todos los datos del body
            const resultado = await citaService.crearCita(req.body);

            // Si el servicio retorna error de validación, enviar status 400 (Bad Request)
            if (!resultado.success) {
                return res.status(400).json(resultado);
            }

            // Si fue exitoso, enviar status 201 (Created) con los datos de la cita creada
            res.status(201).json(resultado);
        } catch (error) {
            // Pasar cualquier error al middleware de manejo de errores
            next(error);
        }
    }

    /**
     * Verificar si una fecha y hora están disponibles para agendar
     * POST /api/citas/verificar-disponibilidad
     * @param {Object} req - Request con fecha y hora en req.body
     * @param {Object} res - Response con disponibilidad
     * @param {Function} next - Middleware de errores
     */
    async verificarDisponibilidad(req, res, next) {
        try {
            // Extraer fecha y hora del body de la petición
            const { fecha, hora } = req.body;

            // Validar que ambos campos estén presentes
            if (!fecha || !hora) {
                return res.status(400).json({
                    success: false,
                    mensaje: 'Fecha y hora son requeridos'
                });
            }

            // Consultar disponibilidad en el servicio
            const resultado = await citaService.verificarDisponibilidad(fecha, hora);

            // Si hay conflicto de horario, retornar error
            if (!resultado.success) {
                return res.status(400).json(resultado);
            }

            // Retornar disponibilidad confirmada
            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtener todas las citas del sistema (solo admin)
     * GET /api/citas
     * @param {Object} req - Request
     * @param {Object} res - Response con array de todas las citas
     * @param {Function} next - Middleware de errores
     */
    async obtenerTodasCitas(req, res, next) {
        try {
            // Obtener todas las citas del sistema
            const resultado = await citaService.obtenerTodasCitas();

            if (!resultado.success) {
                return res.status(400).json(resultado);
            }

            // Retornar array de citas
            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtener todas las citas de un paciente específico
     * GET /api/citas/paciente/:pacienteId
     * @param {Object} req - Request con pacienteId en params
     * @param {Object} res - Response con citas del paciente
     * @param {Function} next - Middleware de errores
     */
    async obtenerCitasPorPaciente(req, res, next) {
        try {
            // Extraer el ID del paciente de los parámetros de la URL
            const { pacienteId } = req.params;
            // Buscar todas las citas asociadas a ese paciente
            const resultado = await citaService.obtenerCitasPorPaciente(pacienteId);

            if (!resultado.success) {
                return res.status(400).json(resultado);
            }

            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtener todas las citas asignadas a un veterinario
     * GET /api/citas/veterinario/:veterinarioId
     * @param {Object} req - Request con veterinarioId en params
     * @param {Object} res - Response con citas del veterinario
     * @param {Function} next - Middleware de errores
     */
    async obtenerCitasPorVeterinario(req, res, next) {
        try {
            // Extraer ID del veterinario de los parámetros
            const { veterinarioId } = req.params;
            // Obtener citas asignadas a ese veterinario
            const resultado = await citaService.obtenerCitasPorVeterinario(veterinarioId);

            if (!resultado.success) {
                return res.status(400).json(resultado);
            }

            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Actualizar el estado de una cita
     * PATCH /api/citas/:citaId/estado
     * Estados permitidos: pendiente, confirmada, cancelada, completada
     * @param {Object} req - Request con citaId en params y nuevo estado en body
     * @param {Object} res - Response con cita actualizada
     * @param {Function} next - Middleware de errores
     */
    async actualizarEstadoCita(req, res, next) {
        try {
            const { citaId } = req.params;
            const { estado } = req.body;

            // Validar que el estado sea proporcionado
            if (!estado) {
                return res.status(400).json({
                    success: false,
                    mensaje: 'El estado es requerido'
                });
            }

            // Validar que el estado sea uno de los valores permitidos
            // Solo se aceptan estos 4 estados para mantener integridad de datos
            const estadosPermitidos = ['pendiente', 'confirmada', 'cancelada', 'completada'];
            if (!estadosPermitidos.includes(estado)) {
                return res.status(400).json({
                    success: false,
                    mensaje: 'Estado inválido. Debe ser: pendiente, confirmada, cancelada o completada'
                });
            }

            // Actualizar estado en la base de datos
            const resultado = await citaService.actualizarEstadoCita(citaId, estado);

            if (!resultado.success) {
                return res.status(400).json(resultado);
            }

            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Asignar un veterinario a una cita (solo admin)
     * PATCH /api/citas/:citaId/asignar
     * @param {Object} req - Request con citaId en params y veterinarioId en body
     * @param {Object} res - Response con cita actualizada
     * @param {Function} next - Middleware de errores
     */
    async asignarVeterinario(req, res, next) {
        try {
            const { citaId } = req.params;
            const { veterinarioId } = req.body;

            // Validar que el veterinarioId sea proporcionado
            if (!veterinarioId) {
                return res.status(400).json({
                    success: false,
                    mensaje: 'El ID del veterinario es requerido'
                });
            }

            // Asignar veterinario a la cita
            const resultado = await citaService.asignarVeterinario(citaId, veterinarioId);

            if (!resultado.success) {
                return res.status(400).json(resultado);
            }

            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Actualizar información completa de una cita
     * PUT /api/citas/:citaId
     * @param {Object} req - Request con citaId en params y datos en body
     * @param {Object} res - Response con cita actualizada
     * @param {Function} next - Middleware de errores
     */
    async actualizarCita(req, res, next) {
        try {
            const { citaId } = req.params;
            // Obtener todos los datos a actualizar del body
            const datos = req.body;

            // Actualizar cita completa con los nuevos datos
            const resultado = await citaService.actualizarCitaCompleta(citaId, datos);

            if (!resultado.success) {
                return res.status(400).json(resultado);
            }

            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Guardar el registro clínico de una cita (veterinario)
     * POST /api/citas/:citaId/registro-clinico
     * Incluye: diagnóstico, tratamiento, signos vitales, etc.
     * @param {Object} req - Request con citaId en params y registro en body
     * @param {Object} res - Response con registro guardado
     * @param {Function} next - Middleware de errores
     */
    async guardarRegistroClinico(req, res, next) {
        try {
            const { citaId } = req.params;
            // Obtener todos los datos del registro clínico del body
            const registroClinico = req.body;

            // Guardar registro clínico en la cita
            const resultado = await citaService.guardarRegistroClinico(citaId, registroClinico);

            if (!resultado.success) {
                return res.status(400).json(resultado);
            }

            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Actualizar un registro clínico existente
     * PUT /api/citas/:citaId/registro-clinico
     * @param {Object} req - Request con citaId en params y datos actualizados en body
     * @param {Object} res - Response con registro actualizado
     * @param {Function} next - Middleware de errores
     */
    async actualizarRegistroClinico(req, res, next) {
        try {
            const { citaId } = req.params;
            // Datos actualizados del registro clínico
            const registroClinico = req.body;

            // Actualizar registro clínico existente
            const resultado = await citaService.actualizarRegistroClinico(citaId, registroClinico);

            if (!resultado.success) {
                return res.status(400).json(resultado);
            }

            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Eliminar una cita del sistema
     * DELETE /api/citas/:citaId
     * @param {Object} req - Request con citaId en params
     * @param {Object} res - Response confirmando eliminación
     * @param {Function} next - Middleware de errores
     */
    async eliminarCita(req, res, next) {
        try {
            const { citaId } = req.params;
            // Eliminar cita de la base de datos
            const resultado = await citaService.eliminarCita(citaId);

            if (!resultado.success) {
                return res.status(400).json(resultado);
            }

            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Marcar una cita como revisada por el veterinario
     * PATCH /api/citas/:citaId/revisada
     * @param {Object} req - Request con citaId en params y usuario autenticado
     * @param {Object} res - Response con cita marcada como revisada
     * @param {Function} next - Middleware de errores
     */
    async marcarComoRevisada(req, res, next) {
        try {
            const { citaId } = req.params;
            // Obtener el veterinarioId del usuario autenticado
            // req.usuario viene del middleware de autenticación JWT
            // Usar optional chaining (?.) para evitar errores si usuario es undefined
            const veterinarioId = req.usuario?.id || req.usuario?._id;
            
            // Marcar cita como revisada por este veterinario
            const resultado = await citaService.marcarComoRevisada(citaId, veterinarioId);

            if (!resultado.success) {
                return res.status(400).json(resultado);
            }

            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtener citas activas (pendientes y confirmadas) de un veterinario
     * GET /api/citas/veterinario/:veterinarioId/activas
     * @param {Object} req - Request con veterinarioId en params
     * @param {Object} res - Response con citas activas
     * @param {Function} next - Middleware de errores
     */
    async obtenerCitasActivas(req, res, next) {
        try {
            const { veterinarioId } = req.params;
            // Obtener solo citas con estado pendiente o confirmada
            const resultado = await citaService.obtenerCitasActivas(veterinarioId);

            if (!resultado.success) {
                return res.status(400).json(resultado);
            }

            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtener historial de citas completadas de un veterinario
     * GET /api/citas/veterinario/:veterinarioId/historial
     * @param {Object} req - Request con veterinarioId en params
     * @param {Object} res - Response con historial de citas
     * @param {Function} next - Middleware de errores
     */
    async obtenerHistorialCitas(req, res, next) {
        try {
            const { veterinarioId } = req.params;
            // Obtener solo citas completadas o canceladas (historial)
            const resultado = await citaService.obtenerHistorialCitas(veterinarioId);

            if (!resultado.success) {
                return res.status(400).json(resultado);
            }

            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }
}

// Exportar una instancia única del controlador (Singleton)
// Esto evita crear múltiples instancias y mantiene consistencia
module.exports = new CitaController();
