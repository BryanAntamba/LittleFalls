const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    apellido: {
        type: String,
        required: true
    },
    edad: {
        type: Number,
        required: true
    },
    correo: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    tipoUsuario: {
        type: String,
        required: true,
        enum: ['paciente', 'veterinario', 'admin'],
        default: 'paciente'
    },
    activo: {
        type: Boolean,
        default: true
    },
    verificado: {
        type: Boolean,
        default: false
    },
    codigoVerificacion: {
        type: String,
        default: null
    },
    codigoExpiracion: {
        type: Date,
        default: null
    },
    // Campos para recuperación de contraseña
    codigoRecuperacion: {
        type: String,
        default: null
    },
    codigoRecuperacionExpiracion: {
        type: Date,
        default: null
    },
    fechaRegistro: {
        type: Date,
        default: Date.now
    }
}, { versionKey: false }); // Desactiva el __v


module.exports = mongoose.model('Usuario', usuarioSchema, 'Usuarios');
