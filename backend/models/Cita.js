// Importación de Mongoose para definir esquemas y modelos
const mongoose = require('mongoose');

// ========== ESQUEMA PARA REGISTRO CLÍNICO ==========
// Esquema anidado que contiene información médica de una consulta veterinaria
// Se usa dentro del esquema de Cita como subdocumento
const registroClinicoSchema = new mongoose.Schema({
    // Fecha en que se realizó la consulta veterinaria
    fechaConsulta: {
        type: Date,
        required: false      // Opcional porque se puede crear cita sin consulta
    },
    // Motivo por el que se solicita la consulta
    motivoConsulta: {
        type: String,
        required: false
    },
    // Síntomas observados en la mascota
    sintomas: {
        type: String,
        required: false
    },
    // ========== SIGNOS VITALES ==========
    // Peso de la mascota en kilogramos
    peso: {
        type: Number,
        required: false
    },
    // Temperatura corporal en grados Celsius
    temperatura: {
        type: Number,
        required: false
    },
    // Frecuencia cardíaca (latidos por minuto)
    frecuenciaCardiaca: {
        type: Number,
        required: false
    },
    // Frecuencia respiratoria (respiraciones por minuto)
    frecuenciaRespiratoria: {
        type: Number,
        required: false
    },
    // ========== EVALUACIÓN CLÍNICA ==========
    // Estado físico de la mascota (ej: "delgado", "normal", "sobrepeso")
    condicionCorporal: {
        type: String,
        required: false
    },
    // Diagnóstico del veterinario
    diagnostico: {
        type: String,
        required: false
    },
    // Tratamiento prescrito
    tratamiento: {
        type: String,
        required: false
    },
    // Procedimientos realizados (ej: "radiografía", "análisis de sangre")
    procedimientos: {
        type: String,
        required: false
    },
    // Fecha sugerida para próxima cita de seguimiento
    proximaCita: {
        type: Date,
        required: false
    },
    // ========== INFORMACIÓN DE VACUNACIÓN ==========
    // Tipo de vacuna aplicada
    tipoVacuna: {
        type: String,
        required: false
    },
    // Fecha en que se aplicó la vacuna
    fechaVacuna: {
        type: Date,
        required: false
    },
    // Fecha programada para la siguiente dosis
    proximaDosis: {
        type: Date,
        required: false
    },
    // ========== NOTAS ADICIONALES ==========
    // Observaciones generales del veterinario
    observaciones: {
        type: String,
        required: false
    },
    // Recomendaciones para el cuidado de la mascota
    recomendaciones: {
        type: String,
        required: false
    }
}, { 
    _id: false               // No generar _id para subdocumentos (no necesario)
});

// ========== ESQUEMA PRINCIPAL DE CITA ==========
const citaSchema = new mongoose.Schema({
    // ========== INFORMACIÓN DEL PACIENTE (DUEÑO) ==========
    // Referencia al usuario paciente en la colección Usuarios
    pacienteId: {
        type: mongoose.Schema.Types.ObjectId,  // Tipo ObjectId (ID de MongoDB)
        ref: 'Usuario',                        // Referencia al modelo Usuario
        required: false                        // Opcional para permitir citas sin login
    },
    // Datos del paciente duplicados para acceso rápido sin JOIN
    nombrePaciente: {
        type: String,
        required: true       // Obligatorio siempre
    },
    apellidoPaciente: {
        type: String,
        required: true
    },
    correoPaciente: {
        type: String,
        required: true
    },
    telefonoPaciente: {
        type: String,
        required: true
    },
    
    // ========== INFORMACIÓN DE LA MASCOTA ==========
    // Nombre de la mascota
    nombreMascota: {
        type: String,
        required: true
    },
    // Edad de la mascota en años
    edadMascota: {
        type: Number,
        required: true
    },
    // Tipo de animal - solo permite valores específicos
    tipoMascota: {
        type: String,
        required: true,
        enum: ['Perro', 'Gato', 'Conejo', 'Hammster', 'Ave', 'Cuy', 'Raton']
    },
    // Sexo de la mascota
    sexoMascota: {
        type: String,
        required: true,
        enum: ['Macho', 'Hembra']  // Solo permite estos dos valores
    },
    
    // ========== INFORMACIÓN DE LA CITA ==========
    // Fecha programada para la cita
    fecha: {
        type: Date,
        required: true
    },
    // Hora de la cita en formato string (ej: "10:00", "14:30")
    hora: {
        type: String,
        required: true
    },
    // Descripción del motivo de la cita
    descripcion: {
        type: String,
        required: true
    },
    
    // ========== ESTADO DE LA CITA ==========
    // Controla el flujo de la cita en el sistema
    estado: {
        type: String,
        required: true,
        // pendiente = creada pero no confirmada
        // confirmada = veterinario confirmó la cita
        // cancelada = cancelada por alguna de las partes
        // completada = consulta realizada
        enum: ['pendiente', 'confirmada', 'cancelada', 'completada'],
        default: 'pendiente'
    },
    
    // ========== ASIGNACIÓN DE VETERINARIO ==========
    // Referencia al usuario veterinario asignado
    veterinarioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',      // Debe ser un usuario con tipoUsuario = 'veterinario'
        required: false      // Opcional, se asigna después
    },
    
    // ========== INFORMACIÓN MÉDICA (VETERINARIOS) ==========
    // Campos que solo los veterinarios pueden llenar
    diagnostico: {
        type: String,
        required: false
    },
    tratamiento: {
        type: String,
        required: false
    },
    notasVeterinario: {
        type: String,
        required: false
    },
    
    // ========== REGISTRO CLÍNICO ==========
    // Registro clínico principal (mantener para compatibilidad con código antiguo)
    registroClinico: {
        type: registroClinicoSchema,  // Usa el esquema definido arriba
        required: false
    },
    
    // Historial completo de todos los registros clínicos de la mascota
    // Array de registros (permite múltiples consultas para la misma mascota)
    registrosClinicosHistorial: {
        type: [registroClinicoSchema],  // Array de subdocumentos
        default: []                      // Array vacío por defecto
    },
    
    // ========== FLAGS DE CONTROL ==========
    // Indica si la cita ya tiene registro clínico completado
    tieneRegistroClinico: {
        type: Boolean,
        default: false
    },
    // Indica si el veterinario ya revisó la cita
    revisada: {
        type: Boolean,
        default: false
    },
    
    // ========== FECHAS DE AUDITORÍA ==========
    // Fecha en que se creó la cita
    fechaCreacion: {
        type: Date,
        default: Date.now    // Función que retorna fecha actual
    },
    // Fecha de última modificación
    fechaActualizacion: {
        type: Date,
        default: Date.now
    }
});

// ========== MIDDLEWARE PRE-SAVE ==========
// Se ejecuta automáticamente antes de guardar un documento
// Actualiza fechaActualizacion cada vez que se modifica la cita
citaSchema.pre('save', function() {
    this.fechaActualizacion = Date.now();
});

// ========== EXPORTAR MODELO ==========
// Crea y exporta el modelo Cita
// MongoDB creará automáticamente la colección 'citas' (pluralizado y minúsculas)
module.exports = mongoose.model('Cita', citaSchema);
