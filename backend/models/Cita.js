const mongoose = require('mongoose');

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
