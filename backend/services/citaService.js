const Cita = require('../models/Cita');

class CitaService {

    async crearCita(datos) {
        try {
            const {
                nombrePaciente,
                apellidoPaciente,
                correoPaciente,
                telefonoPaciente,
                nombreMascota,
                edadMascota,
                tipoMascota,
                sexoMascota,
                fecha,
                hora,
                descripcion,
                pacienteId
            } = datos;

            const nuevaCita = new Cita({
                pacienteId: pacienteId || null,
                nombrePaciente,
                apellidoPaciente,
                correoPaciente,
                telefonoPaciente,
                nombreMascota,
                edadMascota,
                tipoMascota,
                sexoMascota,
                fecha,
                hora,
                descripcion,
                estado: 'pendiente'
            });

            await nuevaCita.save();

            return {
                success: true,
                mensaje: 'Cita agendada exitosamente',
                cita: nuevaCita
            };
        } catch (error) {
            console.error('Error en crearCita:', error);
            return {
                success: false,
                mensaje: 'Error al agendar cita',
                error: error.message
            };
        }
    }

    async obtenerTodasCitas() {
        try {
            const citas = await Cita.find()
                .populate('pacienteId', 'nombre apellido correo')
                .populate('veterinarioId', 'nombre apellido')
                .sort({ fecha: 1, hora: 1 })
                .lean()
                .exec();

            return {
                success: true,
                citas
            };
        } catch (error) {
            console.error('Error en obtenerTodasCitas:', error);
            return {
                success: false,
                mensaje: 'Error al obtener citas',
                error: error.message
            };
        }
    }

    async obtenerCitasPorPaciente(pacienteId) {
        try {
            const citas = await Cita.find({ pacienteId })
                .populate('veterinarioId', 'nombre apellido')
                .sort({ fecha: -1 })
                .lean()
                .exec();

            return {
                success: true,
                citas
            };
        } catch (error) {
            console.error('Error en obtenerCitasPorPaciente:', error);
            return {
                success: false,
                mensaje: 'Error al obtener citas',
                error: error.message
            };
        }
    }

    async obtenerCitasPorVeterinario(veterinarioId) {
        try {
            const citas = await Cita.find({ veterinarioId })
                .populate('pacienteId', 'nombre apellido correo telefono')
                .sort({ fecha: 1, hora: 1 })
                .lean()
                .exec();

            return {
                success: true,
                citas
            };
        } catch (error) {
            console.error('Error en obtenerCitasPorVeterinario:', error);
            return {
                success: false,
                mensaje: 'Error al obtener citas',
                error: error.message
            };
        }
    }

    async actualizarEstadoCita(citaId, estado) {
        try {
            const cita = await Cita.findById(citaId);
            
            if (!cita) {
                return {
                    success: false,
                    mensaje: 'Cita no encontrada'
                };
            }

            cita.estado = estado;
            await cita.save();

            return {
                success: true,
                mensaje: 'Estado de cita actualizado',
                cita
            };
        } catch (error) {
            console.error('Error en actualizarEstadoCita:', error);
            return {
                success: false,
                mensaje: 'Error al actualizar estado',
                error: error.message
            };
        }
    }

    async asignarVeterinario(citaId, veterinarioId) {
        try {
            const cita = await Cita.findById(citaId);
            
            if (!cita) {
                return {
                    success: false,
                    mensaje: 'Cita no encontrada'
                };
            }

            cita.veterinarioId = veterinarioId;
            await cita.save();

            return {
                success: true,
                mensaje: 'Veterinario asignado exitosamente',
                cita
            };
        } catch (error) {
            console.error('Error en asignarVeterinario:', error);
            return {
                success: false,
                mensaje: 'Error al asignar veterinario',
                error: error.message
            };
        }
    }

    async eliminarCita(citaId) {
        try {
            const cita = await Cita.findByIdAndDelete(citaId);
            
            if (!cita) {
                return {
                    success: false,
                    mensaje: 'Cita no encontrada'
                };
            }

            return {
                success: true,
                mensaje: 'Cita eliminada exitosamente'
            };
        } catch (error) {
            console.error('Error en eliminarCita:', error);
            return {
                success: false,
                mensaje: 'Error al eliminar cita',
                error: error.message
            };
        }
    }
}

module.exports = new CitaService();
