const mongoose = require('mongoose');

// Esquema para el registro clínico
const registroClinicoSchema = new mongoose.Schema({
    fechaConsulta: {
        type: Date,
        required: false
    },
    motivoConsulta: {
        type: String,
        required: false
    },
    sintomas: {
        type: String,
        required: false
    },
    peso: {
        type: Number,
        required: false
    },
    temperatura: {
        type: Number,
        required: false
    },
    frecuenciaCardiaca: {
        type: Number,
        required: false
    },
    frecuenciaRespiratoria: {
        type: Number,
        required: false
    },
    condicionCorporal: {
        type: String,
        required: false
    },
    diagnostico: {
        type: String,
        required: false
    },
    tratamiento: {
        type: String,
        required: false
    },
    procedimientos: {
        type: String,
        required: false
    },
    proximaCita: {
        type: Date,
        required: false
    },
    tipoVacuna: {
        type: String,
        required: false
    },
    fechaVacuna: {
        type: Date,
        required: false
    },
    proximaDosis: {
        type: Date,
        required: false
    },
    observaciones: {
        type: String,
        required: false
    },
    recomendaciones: {
        type: String,
        required: false
    }
}, { _id: false });

const citaSchema = new mongoose.Schema({
    // Información del paciente
    pacienteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: false
    },
    nombrePaciente: {
        type: String,
        required: true
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
    
    // Información de la mascota
    nombreMascota: {
        type: String,
        required: true
    },
    edadMascota: {
        type: Number,
        required: true
    },
    tipoMascota: {
        type: String,
        required: true,
        enum: ['Perro', 'Gato', 'Conejo', 'Hammster', 'Ave', 'Cuy', 'Raton']
    },
    sexoMascota: {
        type: String,
        required: true,
        enum: ['Macho', 'Hembra']
    },
    
    // Información de la cita
    fecha: {
        type: Date,
        required: true
    },
    hora: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
        required: true
    },
    
    // Estado de la cita
    estado: {
        type: String,
        required: true,
        enum: ['pendiente', 'confirmada', 'cancelada', 'completada'],
        default: 'pendiente'
    },
    
    // Veterinario asignado
    veterinarioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: false
    },
    
    // Información médica (solo para veterinarios)
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
    
    // Registro clínico antiguo (mantener para compatibilidad)
    registroClinico: {
        type: registroClinicoSchema,
        required: false
    },
    
    // Historial de registros clínicos (array de múltiples consultas)
    registrosClinicosHistorial: {
        type: [registroClinicoSchema],
        default: []
    },
    
    // Control de flujo de revisión
    tieneRegistroClinico: {
        type: Boolean,
        default: false
    },
    revisada: {
        type: Boolean,
        default: false
    },
    
    // Fechas de control
    fechaCreacion: {
        type: Date,
        default: Date.now
    },
    fechaActualizacion: {
        type: Date,
        default: Date.now
    }
});

// Actualizar fechaActualizacion antes de guardar
citaSchema.pre('save', function() {
    this.fechaActualizacion = Date.now();
});

module.exports = mongoose.model('Cita', citaSchema);
