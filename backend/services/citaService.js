// Importar modelo de Cita desde MongoDB
const Cita = require('../models/Cita');

/**
 * Servicio de lógica de negocio para gestión de citas veterinarias
 * Contiene toda la lógica CRUD y reglas de negocio relacionadas con citas
 * Se encarga de validaciones, consultas a BD y procesamiento de datos
 */
class CitaService {

    /**
     * Crear una nueva cita veterinaria en el sistema
     * Valida campos numéricos y disponibilidad de horario antes de crear
     * @param {Object} datos - Datos completos de la cita
     * @param {string} datos.nombrePaciente - Nombre del dueño
     * @param {string} datos.apellidoPaciente - Apellido del dueño
     * @param {string} datos.correoPaciente - Email del dueño
     * @param {string} datos.telefonoPaciente - Teléfono del dueño
     * @param {string} datos.nombreMascota - Nombre de la mascota
     * @param {number} datos.edadMascota - Edad de la mascota en años
     * @param {string} datos.tipoMascota - Tipo de mascota (perro, gato, etc)
     * @param {string} datos.sexoMascota - Sexo de la mascota (macho/hembra)
     * @param {Date} datos.fecha - Fecha de la cita
     * @param {string} datos.hora - Hora de la cita
     * @param {string} datos.descripcion - Motivo de la consulta
     * @param {string} datos.pacienteId - ID del usuario paciente (opcional)
     * @returns {Object} Resultado con success, mensaje y cita creada
     */
    async crearCita(datos) {
        try {
            // Desestructurar todos los campos necesarios del objeto datos
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

            // Validar que campos numéricos contengan valores válidos
            // Evita errores de tipo de dato en la base de datos
            const erroresValidacion = this.validarCamposNumericos(datos);
            // Si hay errores de validación, retornar sin crear la cita
            if (erroresValidacion.length > 0) {
                return {
                    success: false,
                    mensaje: 'Errores de validación',
                    errores: erroresValidacion
                };
            }

            // Verificar si ya existe una cita en la misma fecha y hora
            // Esto evita conflictos de horarios (doble reserva)
            const citaExistente = await Cita.findOne({
                fecha: fecha,
                hora: hora,
                estado: { $ne: 'cancelada' }  // No contar las citas canceladas
            });

            // Si ya existe una cita activa en ese horario, rechazar la creación
            if (citaExistente) {
                return {
                    success: false,
                    mensaje: 'Ese día y hora ya no están disponibles para agendar una cita. Por favor, intente con otra hora o día.'
                };
            }

            // Crear nuevo documento de cita con los datos proporcionados
            // pacienteId puede ser null si el usuario no está registrado
            const nuevaCita = new Cita({
                pacienteId: pacienteId || null,  // ID del usuario o null para no registrados
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
                estado: 'pendiente'  // Todas las citas inician como pendientes
            });

            // Guardar la cita en la base de datos MongoDB
            await nuevaCita.save();

            // Retornar éxito con la cita creada
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

    /**
     * Verificar si una fecha y hora están disponibles para agendar cita
     * Busca citas existentes en el mismo día y hora (excluyendo canceladas)
     * @param {Date} fecha - Fecha a verificar
     * @param {string} hora - Hora a verificar (formato HH:mm)
     * @returns {Object} Resultado con disponibilidad (true/false)
     */
    async verificarDisponibilidad(fecha, hora) {
        try {
            // Crear objeto Date para comparación exacta
            const fechaBusqueda = new Date(fecha);
            
            // Definir rango de búsqueda: inicio y fin del día
            // Esto permite buscar todas las citas del mismo día
            const inicioDia = new Date(fechaBusqueda);
            inicioDia.setHours(0, 0, 0, 0);  // 00:00:00.000
            
            const finDia = new Date(fechaBusqueda);
            finDia.setHours(23, 59, 59, 999);  // 23:59:59.999
            
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

    /**
     * Obtener todas las citas del sistema (para administradores)
     * Incluye información de paciente y veterinario mediante populate
     * @returns {Object} Resultado con array de todas las citas
     */
    async obtenerTodasCitas() {
        try {
            // find() sin filtros trae todos los documentos
            const citas = await Cita.find()
                // populate() trae datos relacionados del paciente
                .populate('pacienteId', 'nombre apellido correo')
                // populate() trae datos relacionados del veterinario
                .populate('veterinarioId', 'nombre apellido')
                // Ordenar por fecha y hora ascendente (más cercanas primero)
                .sort({ fecha: 1, hora: 1 })
                // lean() retorna objetos JS planos (más rápido que documentos Mongoose)
                .lean()
                // exec() ejecuta la query
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

    /**
     * Obtener todas las citas de un paciente específico
     * Útil para que pacientes vean su historial de citas
     * @param {string} pacienteId - ID del usuario paciente
     * @returns {Object} Resultado con array de citas del paciente
     */
    async obtenerCitasPorPaciente(pacienteId) {
        try {
            // Filtrar citas solo de este paciente
            const citas = await Cita.find({ pacienteId })
                // Traer información del veterinario asignado
                .populate('veterinarioId', 'nombre apellido')
                // Ordenar por fecha descendente (más recientes primero)
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

    /**
     * Obtener todas las citas asignadas a un veterinario específico
     * Incluye información completa del paciente para facilitar atención
     * @param {string} veterinarioId - ID del usuario veterinario
     * @returns {Object} Resultado con array de citas del veterinario
     */
    async obtenerCitasPorVeterinario(veterinarioId) {
        try {
            // Filtrar solo citas de este veterinario
            const citas = await Cita.find({ veterinarioId })
                // Traer datos completos del paciente para contacto
                .populate('pacienteId', 'nombre apellido correo telefono')
                // Ordenar por fecha y hora ascendente (próximas citas primero)
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

    /**
     * Actualizar el estado de una cita
     * Estados: pendiente, confirmada, cancelada, completada
     * @param {string} citaId - ID de la cita a actualizar
     * @param {string} estado - Nuevo estado de la cita
     * @returns {Object} Resultado con cita actualizada
     */
    async actualizarEstadoCita(citaId, estado) {
        try {
            // Buscar cita por ID
            const cita = await Cita.findById(citaId);
            
            // Validar que la cita exista
            if (!cita) {
                return {
                    success: false,
                    mensaje: 'Cita no encontrada'
                };
            }

            // Actualizar estado
            cita.estado = estado;
            // Guardar cambios en la base de datos
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

    /**
     * Asignar un veterinario a una cita (solo administradores)
     * Permite distribuir citas entre veterinarios disponibles
     * @param {string} citaId - ID de la cita
     * @param {string} veterinarioId - ID del veterinario a asignar
     * @returns {Object} Resultado con cita actualizada
     */
    async asignarVeterinario(citaId, veterinarioId) {
        try {
            const cita = await Cita.findById(citaId);
            
            // Validar que la cita exista
            if (!cita) {
                return {
                    success: false,
                    mensaje: 'Cita no encontrada'
                };
            }

            // Asignar veterinario a la cita
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

    /**
     * Actualizar múltiples campos de una cita
     * Permite actualizar cualquier información de la cita de forma flexible
     * @param {string} citaId - ID de la cita a actualizar
     * @param {Object} datos - Objeto con los campos a actualizar
     * @returns {Object} Resultado con cita actualizada
     */
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

            // Actualizar solo los campos que fueron proporcionados (actualización parcial)
            // !== undefined verifica si el campo fue enviado en la petición
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

            // Guardar todos los cambios
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
     * Valida que los campos numéricos contengan solo números válidos
     * Previene errores de tipo de dato en MongoDB
     * Valida: edad, peso, temperatura, frecuencias cardíaca y respiratoria
     * @param {Object} datos - Datos a validar
     * @returns {Array} Array de mensajes de error encontrados (vacío si todo OK)
     */
    validarCamposNumericos(datos) {
        const errores = [];
        // Definir qué campos deben ser numéricos y sus nombres legibles
        const camposNumericos = {
            'edadMascota': 'Edad de la mascota',
            'peso': 'Peso',
            'temperatura': 'Temperatura',
            'frecuenciaCardiaca': 'Frecuencia cardíaca',
            'frecuenciaRespiratoria': 'Frecuencia respiratoria'
        };

        // Iterar sobre cada campo numérico esperado
        for (const [campo, nombre] of Object.entries(camposNumericos)) {
            // Solo validar si el campo fue proporcionado
            if (datos[campo] !== undefined && datos[campo] !== null && datos[campo] !== '') {
                const valor = datos[campo];
                // Verificar que sea un número válido (incluyendo decimales)
                // Regex: permite números enteros o decimales, positivos o negativos
                if (isNaN(valor) || typeof valor === 'string' && !/^-?\d+(\.\d+)?$/.test(valor.trim())) {
                    errores.push(`${nombre} debe ser un número válido`);
                }
                // Validar que sea positivo para ciertos campos (no tiene sentido edad negativa)
                if (!isNaN(valor) && parseFloat(valor) < 0) {
                    errores.push(`${nombre} no puede ser negativo`);
                }
            }
        }

        return errores;
    }

    /**
     * Guardar un nuevo registro clínico en una cita
     * Incluye diagnóstico, tratamiento, signos vitales, etc.
     * Se agrega al historial de registros de la cita
     * @param {string} citaId - ID de la cita
     * @param {Object} registroClinico - Datos del registro clínico
     * @returns {Object} Resultado con cita actualizada
     */
    async guardarRegistroClinico(citaId, registroClinico) {
        try {
            const cita = await Cita.findById(citaId);
            
            if (!cita) {
                return {
                    success: false,
                    mensaje: 'Cita no encontrada'
                };
            }

            // Validar campos numéricos del registro clínico (peso, temperatura, etc.)
            const erroresValidacion = this.validarCamposNumericos(registroClinico);
            if (erroresValidacion.length > 0) {
                return {
                    success: false,
                    mensaje: 'Errores de validación',
                    errores: erroresValidacion
                };
            }

            // Inicializar el array de registros si no existe
            // Esto permite que una cita tenga múltiples registros (historial médico)
            if (!cita.registrosClinicosHistorial) {
                cita.registrosClinicosHistorial = [];
            }

            // Agregar el nuevo registro clínico al array de historial
            cita.registrosClinicosHistorial.push(registroClinico);
            
            // Marcar que tiene registro clínico (flag de control)
            cita.tieneRegistroClinico = true;
            
            // También actualizar los campos principales con el último registro
            // Esto facilita acceso rápido al diagnóstico/tratamiento actual
            if (registroClinico.diagnostico) cita.diagnostico = registroClinico.diagnostico;
            if (registroClinico.tratamiento) cita.tratamiento = registroClinico.tratamiento;
            
            await cita.save();

            // Recargar la cita desde la BD para obtener los valores actualizados
            // lean() retorna objeto plano en lugar de documento Mongoose
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

    /**
     * Actualizar un registro clínico existente
     * Permite modificar registros ya guardados (corrección de errores, actualizaciones)
     * @param {string} citaId - ID de la cita
     * @param {Object} registroClinico - Datos actualizados del registro
     * @param {number} registroClinico.indiceRegistro - Índice del registro a actualizar (opcional)
     * @returns {Object} Resultado con cita actualizada
     */
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

            // Verificar que existan registros para actualizar
            if (!cita.registrosClinicosHistorial || cita.registrosClinicosHistorial.length === 0) {
                return {
                    success: false,
                    mensaje: 'No hay registros clínicos para actualizar'
                };
            }

            // Determinar qué registro actualizar:
            // Si se proporciona índice, usar ese. Si no, actualizar el último
            const indice = registroClinico.indiceRegistro !== undefined 
                ? registroClinico.indiceRegistro 
                : cita.registrosClinicosHistorial.length - 1;

            // Actualizar el registro específico combinando datos existentes con nuevos
            // Spread operator (...) mantiene campos no modificados
            cita.registrosClinicosHistorial[indice] = {
                ...cita.registrosClinicosHistorial[indice],
                ...registroClinico
            };
            
            // También actualizar los campos principales con el último registro
            const ultimoRegistro = cita.registrosClinicosHistorial[cita.registrosClinicosHistorial.length - 1];
            if (ultimoRegistro.diagnostico) cita.diagnostico = ultimoRegistro.diagnostico;
            if (ultimoRegistro.tratamiento) cita.tratamiento = ultimoRegistro.tratamiento;
            
            await cita.save();

            // Recargar la cita desde la BD
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

    /**
     * Eliminar una cita del sistema permanentemente
     * Usa findByIdAndDelete para eliminar en una sola operación
     * @param {string} citaId - ID de la cita a eliminar
     * @returns {Object} Resultado confirmando eliminación
     */
    async eliminarCita(citaId) {
        try {
            // findByIdAndDelete busca y elimina en una sola operación atómica
            const cita = await Cita.findByIdAndDelete(citaId);
            
            // Si no se encontró la cita, retornar error
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

    /**
     * Marcar una cita como revisada y moverla al historial
     * Requiere que la cita tenga registro clínico guardado
     * Cambia estado a 'completada' automáticamente
     * @param {string} citaId - ID de la cita
     * @param {string} veterinarioId - ID del veterinario que revisó
     * @returns {Object} Resultado con cita marcada como revisada
     */
    async marcarComoRevisada(citaId, veterinarioId) {
        try {
            const cita = await Cita.findById(citaId);
            
            if (!cita) {
                return {
                    success: false,
                    mensaje: 'Cita no encontrada'
                };
            }

            // Verificar que tenga registro clínico antes de marcar como revisada
            // Esto asegura que toda cita completada tenga su documentación médica
            if (!cita.tieneRegistroClinico) {
                return {
                    success: false,
                    mensaje: 'Debe guardar el registro clínico antes de marcar como revisada'
                };
            }

            // Marcar como revisada y completada
            cita.revisada = true;
            cita.estado = 'completada';
            
            // Asignar veterinario si no lo tiene (por si fue cita sin asignar)
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

    /**
     * Obtener citas activas (no revisadas) para un veterinario
     * Incluye citas sin asignar y las asignadas al veterinario específico
     * Excluye citas ya marcadas como revisadas
     * @param {string} veterinarioId - ID del veterinario
     * @returns {Object} Resultado con array de citas activas
     */
    async obtenerCitasActivas(veterinarioId) {
        try {
            // Query compleja con múltiples condiciones usando $and y $or
            const citas = await Cita.find({ 
                $and: [
                    // Condición 1: Excluir las citas ya revisadas
                    { 
                        $or: [
                            { revisada: { $ne: true } },  // No revisadas (false o null)
                            { revisada: { $exists: false } }  // Campo no existe
                        ]
                    },
                    // Condición 2: Incluir citas sin veterinario O del veterinario actual
                    // Esto permite que los veterinarios vean citas sin asignar
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
                // Traer datos del paciente para contacto
                .populate('pacienteId', 'nombre apellido correo telefono')
                // Ordenar por próximas citas primero
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

    /**
     * Obtener historial de citas completadas de un veterinario
     * Solo retorna citas marcadas como revisadas (completadas)
     * Útil para ver citas pasadas y su documentación médica
     * @param {string} veterinarioId - ID del veterinario
     * @returns {Object} Resultado con array de citas del historial
     */
    async obtenerHistorialCitas(veterinarioId) {
        try {
            // Filtrar solo citas revisadas de este veterinario
            const citas = await Cita.find({ 
                veterinarioId,
                revisada: true  // Solo citas revisadas (en historial)
            })
                .populate('pacienteId', 'nombre apellido correo telefono')
                // Ordenar por fecha de actualización descendente (más recientes primero)
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

// Exportar una instancia única del servicio (Singleton)
// Esto asegura que todas las partes de la app usen la misma instancia
module.exports = new CitaService();
