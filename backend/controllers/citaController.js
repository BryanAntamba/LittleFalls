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

            const resultado = await citaService.asignarVeterinario(citaId, veterinarioId);

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
}

module.exports = new CitaController();
