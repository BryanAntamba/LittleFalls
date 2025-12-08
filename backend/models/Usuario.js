// Importación de Mongoose para definir esquemas y modelos
const mongoose = require('mongoose');

// ========== DEFINICIÓN DEL ESQUEMA DE USUARIO ==========
// Un esquema define la estructura de los documentos en la colección
const usuarioSchema = new mongoose.Schema({
    // Nombre del usuario
    nombre: {
        type: String,        // Tipo de dato: cadena de texto
        required: true       // Campo obligatorio
    },
    // Apellido del usuario
    apellido: {
        type: String,
        required: true
    },
    // Edad del usuario
    edad: {
        type: Number,        // Tipo de dato: número
        required: true
    },
    // Correo electrónico (usado para login)
    correo: {
        type: String,
        required: true,
        unique: true,        // No pueden existir dos usuarios con el mismo correo
        lowercase: true      // Convierte automáticamente a minúsculas antes de guardar
    },
    // Contraseña (debe estar hasheada con bcrypt, nunca en texto plano)
    password: {
        type: String,
        required: true
    },
    // Tipo de usuario: define roles y permisos
    tipoUsuario: {
        type: String,
        required: true,
        enum: ['paciente', 'veterinario', 'admin'],  // Solo permite estos 3 valores
        default: 'paciente'  // Valor por defecto si no se especifica
    },
    // Estado del usuario (activo/inactivo)
    activo: {
        type: Boolean,       // Tipo de dato: booleano (true/false)
        default: true        // Por defecto los usuarios están activos
    },
    // Indica si el usuario verificó su correo electrónico
    verificado: {
        type: Boolean,
        default: false       // Por defecto no verificado
    },
    // Código de verificación de 6 dígitos enviado por email
    codigoVerificacion: {
        type: String,
        default: null        // null = no hay código activo
    },
    // Fecha de expiración del código de verificación
    codigoExpiracion: {
        type: Date,          // Tipo de dato: fecha/hora
        default: null
    },
    // ========== CAMPOS PARA RECUPERACIÓN DE CONTRASEÑA ==========
    // Código de 6 dígitos para recuperar contraseña
    codigoRecuperacion: {
        type: String,
        default: null
    },
    // Fecha de expiración del código de recuperación
    codigoRecuperacionExpiracion: {
        type: Date,
        default: null
    },
    // Fecha en que se registró el usuario
    fechaRegistro: {
        type: Date,
        default: Date.now    // Función que retorna la fecha actual al crear el documento
    }
}, { 
    versionKey: false        // Desactiva el campo __v que Mongoose añade por defecto
});

// ========== EXPORTAR MODELO ==========
// mongoose.model() crea un modelo a partir del esquema
// Parámetros:
// 1. 'Usuario' = nombre del modelo (usado en código)
// 2. usuarioSchema = esquema definido arriba
// 3. 'Usuarios' = nombre de la colección en MongoDB (opcional, por defecto sería 'usuarios')
module.exports = mongoose.model('Usuario', usuarioSchema, 'Usuarios');
