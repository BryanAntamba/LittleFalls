const validator = require('validator');

/**
 * Middleware para validar datos de login
 */
const validateLogin = (req, res, next) => {
    const { correo, password } = req.body;
    const errors = [];

    // Validar que existan todos los campos
    if (!correo) {
        errors.push('El correo es requerido');
    }
    if (!password) {
        errors.push('La contraseña es requerida');
    }

    // Validar formato de correo
    if (correo && !validator.isEmail(correo)) {
        errors.push('El formato del correo no es válido');
    }

    // Validar longitud de contraseña
    if (password && password.length < 6) {
        errors.push('La contraseña debe tener al menos 6 caracteres');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            mensaje: 'Errores de validación',
            errores: errors
        });
    }

    next();
};

/**
 * Middleware para validar datos de registro
 */
const validateRegistro = (req, res, next) => {
    const { nombre, apellido, edad, correo, password } = req.body;
    const errors = [];

    // Validar que existan todos los campos
    if (!nombre || nombre.trim() === '') {
        errors.push('El nombre es requerido');
    }
    if (!apellido || apellido.trim() === '') {
        errors.push('El apellido es requerido');
    }
    if (!edad) {
        errors.push('La edad es requerida');
    }
    if (!correo) {
        errors.push('El correo es requerido');
    }
    if (!password) {
        errors.push('La contraseña es requerida');
    }

    // Validar formato de nombre y apellido
    if (nombre && !validator.isAlpha(nombre.replace(/\s/g, ''), 'es-ES')) {
        errors.push('El nombre solo debe contener letras');
    }
    if (apellido && !validator.isAlpha(apellido.replace(/\s/g, ''), 'es-ES')) {
        errors.push('El apellido solo debe contener letras');
    }

    // Validar longitud de nombre y apellido
    if (nombre && (nombre.trim().length < 2 || nombre.trim().length > 50)) {
        errors.push('El nombre debe tener entre 2 y 50 caracteres');
    }
    if (apellido && (apellido.trim().length < 2 || apellido.trim().length > 50)) {
        errors.push('El apellido debe tener entre 2 y 50 caracteres');
    }

    // Validar edad
    if (edad && (!Number.isInteger(Number(edad)) || edad < 18 || edad > 120)) {
        errors.push('La edad debe ser un número entre 18 y 120 años');
    }

    // Validar formato de correo
    if (correo && !validator.isEmail(correo)) {
        errors.push('El formato del correo no es válido');
    }

    // Validar contraseña
    if (password) {
        if (password.length < 6) {
            errors.push('La contraseña debe tener al menos 6 caracteres');
        }
        if (password.length > 100) {
            errors.push('La contraseña no debe exceder 100 caracteres');
        }
        // Validar que tenga al menos una letra y un número
        if (!/[a-zA-Z]/.test(password)) {
            errors.push('La contraseña debe contener al menos una letra');
        }
        if (!/[0-9]/.test(password)) {
            errors.push('La contraseña debe contener al menos un número');
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            mensaje: 'Errores de validación',
            errores: errors
        });
    }

    next();
};

/**
 * Sanitizar datos de entrada
 */
const sanitizeInput = (req, res, next) => {
    if (req.body.nombre) {
        req.body.nombre = validator.escape(validator.trim(req.body.nombre));
    }
    if (req.body.apellido) {
        req.body.apellido = validator.escape(validator.trim(req.body.apellido));
    }
    if (req.body.correo) {
        req.body.correo = validator.normalizeEmail(req.body.correo);
    }
    next();
};

module.exports = {
    validateLogin,
    validateRegistro,
    sanitizeInput
};
