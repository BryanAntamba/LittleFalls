const citaService = require('../services/citaService');

class CitaController {

    async crearCita(req, res, next) {
        try {
            const resultado = await citaService.crearCita(req.body);

            if (!resultado.success) {
                return res.status(400).json(resultado);
            }

            res.status(201).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async verificarDisponibilidad(req, res, next) {
        try {
            const { fecha, hora } = req.body;

            if (!fecha || !hora) {
                return res.status(400).json({
                    success: false,
                    mensaje: 'Fecha y hora son requeridos'
                });
            }

            const resultado = await citaService.verificarDisponibilidad(fecha, hora);

            if (!resultado.success) {
                return res.status(400).json(resultado);
            }

            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async obtenerTodasCitas(req, res, next) {
        try {
            const resultado = await citaService.obtenerTodasCitas();

            if (!resultado.success) {
                return res.status(400).json(resultado);
            }

            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async obtenerCitasPorPaciente(req, res, next) {
        try {
            const { pacienteId } = req.params;
            const resultado = await citaService.obtenerCitasPorPaciente(pacienteId);

            if (!resultado.success) {
                return res.status(400).json(resultado);
            }

            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async obtenerCitasPorVeterinario(req, res, next) {
        try {
            const { veterinarioId } = req.params;
            const resultado = await citaService.obtenerCitasPorVeterinario(veterinarioId);

            if (!resultado.success) {
                return res.status(400).json(resultado);
            }

            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

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
            const estadosPermitidos = ['pendiente', 'confirmada', 'cancelada', 'completada'];
            if (!estadosPermitidos.includes(estado)) {
                return res.status(400).json({
                    success: false,
                    mensaje: 'Estado inválido. Debe ser: pendiente, confirmada, cancelada o completada'
                });
            }

            const resultado = await citaService.actualizarEstadoCita(citaId, estado);

            if (!resultado.success) {
                return res.status(400).json(resultado);
            }

            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

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

            const resultado = await citaService.asignarVeterinario(citaId, veterinarioId);

            if (!resultado.success) {
                return res.status(400).json(resultado);
            }

            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async actualizarCita(req, res, next) {
        try {
            const { citaId } = req.params;
            const datos = req.body;

            const resultado = await citaService.actualizarCitaCompleta(citaId, datos);

            if (!resultado.success) {
                return res.status(400).json(resultado);
            }

            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async guardarRegistroClinico(req, res, next) {
        try {
            const { citaId } = req.params;
            const registroClinico = req.body;

            const resultado = await citaService.guardarRegistroClinico(citaId, registroClinico);

            if (!resultado.success) {
                return res.status(400).json(resultado);
            }

            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async actualizarRegistroClinico(req, res, next) {
        try {
            const { citaId } = req.params;
            const registroClinico = req.body;

            const resultado = await citaService.actualizarRegistroClinico(citaId, registroClinico);

            if (!resultado.success) {
                return res.status(400).json(resultado);
            }

            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async eliminarCita(req, res, next) {
        try {
            const { citaId } = req.params;
            const resultado = await citaService.eliminarCita(citaId);

            if (!resultado.success) {
                return res.status(400).json(resultado);
            }

            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async marcarComoRevisada(req, res, next) {
        try {
            const { citaId } = req.params;
            // Obtener el veterinarioId del usuario autenticado
            const veterinarioId = req.usuario?.id || req.usuario?._id;
            
            const resultado = await citaService.marcarComoRevisada(citaId, veterinarioId);

            if (!resultado.success) {
                return res.status(400).json(resultado);
            }

            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async obtenerCitasActivas(req, res, next) {
        try {
            const { veterinarioId } = req.params;
            const resultado = await citaService.obtenerCitasActivas(veterinarioId);

            if (!resultado.success) {
                return res.status(400).json(resultado);
            }

            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async obtenerHistorialCitas(req, res, next) {
        try {
            const { veterinarioId } = req.params;
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

module.exports = new CitaController();
