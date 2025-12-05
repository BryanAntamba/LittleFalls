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

            // Validar campos numéricos
            const erroresValidacion = this.validarCamposNumericos(datos);
            if (erroresValidacion.length > 0) {
                return {
                    success: false,
                    mensaje: 'Errores de validación',
                    errores: erroresValidacion
                };
            }

            // Verificar si ya existe una cita en la misma fecha y hora
            const citaExistente = await Cita.findOne({
                fecha: fecha,
                hora: hora,
                estado: { $ne: 'cancelada' }  // No contar las citas canceladas
            });

            if (citaExistente) {
                return {
                    success: false,
                    mensaje: 'Ese día y hora ya no están disponibles para agendar una cita. Por favor, intente con otra hora o día.'
                };
            }

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

    async verificarDisponibilidad(fecha, hora) {
        try {
            // Crear objeto Date para comparación exacta
            const fechaBusqueda = new Date(fecha);
            
            // Buscar citas en el mismo día
            const inicioDia = new Date(fechaBusqueda);
            inicioDia.setHours(0, 0, 0, 0);
            
            const finDia = new Date(fechaBusqueda);
            finDia.setHours(23, 59, 59, 999);
            
            const citaExistente = await Cita.findOne({
                fecha: {
                    $gte: inicioDia,
                    $lte: finDia
                },
                hora: hora,
                estado: { $ne: 'cancelada' }
            });

            console.log('Verificando disponibilidad:');
            console.log('- Fecha:', fecha);
            console.log('- Hora:', hora);
            console.log('- Cita existente:', citaExistente ? 'SÍ (NO DISPONIBLE)' : 'NO (DISPONIBLE)');

            return {
                success: true,
                disponible: !citaExistente
            };
        } catch (error) {
            console.error('Error en verificarDisponibilidad:', error);
            return {
                success: false,
                mensaje: 'Error al verificar disponibilidad',
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

    async actualizarCitaCompleta(citaId, datos) {
        try {
            const cita = await Cita.findById(citaId);
            
            if (!cita) {
                return {
                    success: false,
                    mensaje: 'Cita no encontrada'
                };
            }

            // Validar campos numéricos si están presentes
            const erroresValidacion = this.validarCamposNumericos(datos);
            if (erroresValidacion.length > 0) {
                return {
                    success: false,
                    mensaje: 'Errores de validación',
                    errores: erroresValidacion
                };
            }

            // Actualizar campos permitidos
            if (datos.nombrePaciente !== undefined) cita.nombrePaciente = datos.nombrePaciente;
            if (datos.apellidoPaciente !== undefined) cita.apellidoPaciente = datos.apellidoPaciente;
            if (datos.correoPaciente !== undefined) cita.correoPaciente = datos.correoPaciente;
            if (datos.telefonoPaciente !== undefined) cita.telefonoPaciente = datos.telefonoPaciente;
            if (datos.nombreMascota !== undefined) cita.nombreMascota = datos.nombreMascota;
            if (datos.edadMascota !== undefined) cita.edadMascota = datos.edadMascota;
            if (datos.tipoMascota !== undefined) cita.tipoMascota = datos.tipoMascota;
            if (datos.sexoMascota !== undefined) cita.sexoMascota = datos.sexoMascota;
            if (datos.fecha !== undefined) cita.fecha = datos.fecha;
            if (datos.hora !== undefined) cita.hora = datos.hora;
            if (datos.descripcion !== undefined) cita.descripcion = datos.descripcion;
            if (datos.estado !== undefined) cita.estado = datos.estado;
            if (datos.veterinarioId !== undefined) cita.veterinarioId = datos.veterinarioId;
            if (datos.diagnostico !== undefined) cita.diagnostico = datos.diagnostico;
            if (datos.tratamiento !== undefined) cita.tratamiento = datos.tratamiento;
            if (datos.notasVeterinario !== undefined) cita.notasVeterinario = datos.notasVeterinario;

            await cita.save();

            return {
                success: true,
                mensaje: 'Cita actualizada exitosamente',
                cita
            };
        } catch (error) {
            console.error('Error en actualizarCitaCompleta:', error);
            return {
                success: false,
                mensaje: 'Error al actualizar cita',
                error: error.message
            };
        }
    }

    /**
     * Valida que los campos numéricos contengan solo números
     * @param {Object} datos - Datos a validar
     * @returns {Array} - Array de errores encontrados
     */
    validarCamposNumericos(datos) {
        const errores = [];
        const camposNumericos = {
            'edadMascota': 'Edad de la mascota',
            'peso': 'Peso',
            'temperatura': 'Temperatura',
            'frecuenciaCardiaca': 'Frecuencia cardíaca',
            'frecuenciaRespiratoria': 'Frecuencia respiratoria'
        };

        for (const [campo, nombre] of Object.entries(camposNumericos)) {
            if (datos[campo] !== undefined && datos[campo] !== null && datos[campo] !== '') {
                const valor = datos[campo];
                // Verificar que sea un número válido
                if (isNaN(valor) || typeof valor === 'string' && !/^-?\d+(\.\d+)?$/.test(valor.trim())) {
                    errores.push(`${nombre} debe ser un número válido`);
                }
                // Validar que sea positivo para ciertos campos
                if (!isNaN(valor) && parseFloat(valor) < 0) {
                    errores.push(`${nombre} no puede ser negativo`);
                }
            }
        }

        return errores;
    }

    async guardarRegistroClinico(citaId, registroClinico) {
        try {
            const cita = await Cita.findById(citaId);
            
            if (!cita) {
                return {
                    success: false,
                    mensaje: 'Cita no encontrada'
                };
            }

            // Validar campos numéricos del registro clínico
            const erroresValidacion = this.validarCamposNumericos(registroClinico);
            if (erroresValidacion.length > 0) {
                return {
                    success: false,
                    mensaje: 'Errores de validación',
                    errores: erroresValidacion
                };
            }

            // Inicializar el array si no existe
            if (!cita.registrosClinicosHistorial) {
                cita.registrosClinicosHistorial = [];
            }

            // Agregar el nuevo registro clínico al array
            cita.registrosClinicosHistorial.push(registroClinico);
            
            // Marcar que tiene registro clínico
            cita.tieneRegistroClinico = true;
            
            // También actualizar los campos principales con el último registro
            if (registroClinico.diagnostico) cita.diagnostico = registroClinico.diagnostico;
            if (registroClinico.tratamiento) cita.tratamiento = registroClinico.tratamiento;
            
            await cita.save();

            // Recargar la cita desde la BD para obtener los valores actualizados
            const citaActualizada = await Cita.findById(citaId).lean();

            return {
                success: true,
                mensaje: 'Registro clínico guardado exitosamente',
                cita: citaActualizada
            };
        } catch (error) {
            console.error('Error en guardarRegistroClinico:', error);
            return {
                success: false,
                mensaje: 'Error al guardar registro clínico',
                error: error.message
            };
        }
    }

    async actualizarRegistroClinico(citaId, registroClinico) {
        try {
            const cita = await Cita.findById(citaId);
            
            if (!cita) {
                return {
                    success: false,
                    mensaje: 'Cita no encontrada'
                };
            }

            // Validar campos numéricos
            const erroresValidacion = this.validarCamposNumericos(registroClinico);
            if (erroresValidacion.length > 0) {
                return {
                    success: false,
                    mensaje: 'Errores de validación',
                    errores: erroresValidacion
                };
            }

            // Si hay un índice de registro, actualizar ese registro específico
            // Si no, actualizar el último registro del array
            if (!cita.registrosClinicosHistorial || cita.registrosClinicosHistorial.length === 0) {
                return {
                    success: false,
                    mensaje: 'No hay registros clínicos para actualizar'
                };
            }

            const indice = registroClinico.indiceRegistro !== undefined 
                ? registroClinico.indiceRegistro 
                : cita.registrosClinicosHistorial.length - 1;

            // Actualizar el registro específico
            cita.registrosClinicosHistorial[indice] = {
                ...cita.registrosClinicosHistorial[indice],
                ...registroClinico
            };
            
            // También actualizar los campos principales con el último registro
            const ultimoRegistro = cita.registrosClinicosHistorial[cita.registrosClinicosHistorial.length - 1];
            if (ultimoRegistro.diagnostico) cita.diagnostico = ultimoRegistro.diagnostico;
            if (ultimoRegistro.tratamiento) cita.tratamiento = ultimoRegistro.tratamiento;
            
            await cita.save();

            // Recargar la cita desde la BD para obtener los valores actualizados
            const citaActualizada = await Cita.findById(citaId).lean();

            return {
                success: true,
                mensaje: 'Registro clínico actualizado exitosamente',
                cita: citaActualizada
            };
        } catch (error) {
            console.error('Error en actualizarRegistroClinico:', error);
            return {
                success: false,
                mensaje: 'Error al actualizar registro clínico',
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

    async marcarComoRevisada(citaId, veterinarioId) {
        try {
            const cita = await Cita.findById(citaId);
            
            if (!cita) {
                return {
                    success: false,
                    mensaje: 'Cita no encontrada'
                };
            }

            // Verificar que tenga registro clínico
            if (!cita.tieneRegistroClinico) {
                return {
                    success: false,
                    mensaje: 'Debe guardar el registro clínico antes de marcar como revisada'
                };
            }

            // Marcar como revisada y completada
            cita.revisada = true;
            cita.estado = 'completada';
            
            // Asignar veterinario si no lo tiene
            if (!cita.veterinarioId && veterinarioId) {
                cita.veterinarioId = veterinarioId;
            }
            
            await cita.save();

            return {
                success: true,
                mensaje: 'Cita marcada como revisada y movida al historial',
                cita
            };
        } catch (error) {
            console.error('Error en marcarComoRevisada:', error);
            return {
                success: false,
                mensaje: 'Error al marcar cita como revisada',
                error: error.message
            };
        }
    }

    async obtenerCitasActivas(veterinarioId) {
        try {
            const citas = await Cita.find({ 
                $and: [
                    // Excluir las citas ya revisadas
                    { 
                        $or: [
                            { revisada: { $ne: true } },  // No revisadas
                            { revisada: { $exists: false } }  // Sin campo revisada
                        ]
                    },
                    // Incluir citas sin veterinario O del veterinario actual
                    {
                        $or: [
                            { veterinarioId: null },
                            { veterinarioId: { $exists: false } },
                            { veterinarioId: undefined },
                            { veterinarioId: veterinarioId }
                        ]
                    }
                ]
            })
                .populate('pacienteId', 'nombre apellido correo telefono')
                .sort({ fecha: 1, hora: 1 })
                .lean()
                .exec();

            return {
                success: true,
                citas
            };
        } catch (error) {
            console.error('Error en obtenerCitasActivas:', error);
            return {
                success: false,
                mensaje: 'Error al obtener citas activas',
                error: error.message
            };
        }
    }

    async obtenerHistorialCitas(veterinarioId) {
        try {
            const citas = await Cita.find({ 
                veterinarioId,
                revisada: true  // Solo citas revisadas
            })
                .populate('pacienteId', 'nombre apellido correo telefono')
                .sort({ fechaActualizacion: -1 })
                .lean()
                .exec();

            return {
                success: true,
                citas
            };
        } catch (error) {
            console.error('Error en obtenerHistorialCitas:', error);
            return {
                success: false,
                mensaje: 'Error al obtener historial',
                error: error.message
            };
        }
    }
}

module.exports = new CitaService();
