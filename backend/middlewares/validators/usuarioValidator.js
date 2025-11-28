const validator = require('validator');

/**
 * Middleware de validación para creación de usuarios
 */
const validarCreacionUsuario = (req, res, next) => {
    const errores = [];
    const { nombre, apellido, edad, correo, password, tipoUsuario } = req.body;

    // Validar nombre
    if (!nombre || nombre.trim() === '') {
        errores.push('El nombre es obligatorio');
    } else if (nombre.trim().length < 2) {
        errores.push('El nombre debe tener al menos 2 caracteres');
    } else if (nombre.trim().length > 50) {
        errores.push('El nombre no puede tener más de 50 caracteres');
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre.trim())) {
        errores.push('El nombre solo puede contener letras');
    }

    // Validar apellido
    if (!apellido || apellido.trim() === '') {
        errores.push('El apellido es obligatorio');
    } else if (apellido.trim().length < 2) {
        errores.push('El apellido debe tener al menos 2 caracteres');
    } else if (apellido.trim().length > 50) {
        errores.push('El apellido no puede tener más de 50 caracteres');
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(apellido.trim())) {
        errores.push('El apellido solo puede contener letras');
    }

    // Validar edad
    if (!edad) {
        errores.push('La edad es obligatoria');
    } else {
        const edadNum = parseInt(edad);
        if (isNaN(edadNum)) {
            errores.push('La edad debe ser un número válido');
        } else if (edadNum < 18) {
            errores.push('La edad debe ser mayor o igual a 18 años');
        } else if (edadNum > 100) {
            errores.push('La edad no puede ser mayor a 100 años');
        }
    }

    // Validar correo
    if (!correo || correo.trim() === '') {
        errores.push('El correo electrónico es obligatorio');
    } else if (!validator.isEmail(correo)) {
        errores.push('El correo electrónico no es válido');
    }

    // Validar contraseña
    if (!password || password.trim() === '') {
        errores.push('La contraseña es obligatoria');
    } else if (password.length < 6) {
        errores.push('La contraseña debe tener al menos 6 caracteres');
    } else if (password.length > 100) {
        errores.push('La contraseña no puede tener más de 100 caracteres');
    }

    // Validar tipo de usuario
    if (!tipoUsuario) {
        errores.push('El tipo de usuario es obligatorio');
    } else if (!['veterinario', 'admin'].includes(tipoUsuario)) {
        errores.push('El tipo de usuario debe ser "veterinario" o "admin"');
    }

    // Si hay errores, retornar respuesta 400
    if (errores.length > 0) {
        return res.status(400).json({
            success: false,
            mensaje: 'Errores de validación',
            errores
        });
    }

    // Si no hay errores, continuar
    next();
};

/**
 * Middleware de validación para actualización de usuarios
 */
const validarActualizacionUsuario = (req, res, next) => {
    const errores = [];
    const { nombre, apellido, edad, correo, password } = req.body;

    // Validar nombre (si se proporciona)
    if (nombre !== undefined) {
        if (nombre.trim() === '') {
            errores.push('El nombre no puede estar vacío');
        } else if (nombre.trim().length < 2) {
            errores.push('El nombre debe tener al menos 2 caracteres');
        } else if (nombre.trim().length > 50) {
            errores.push('El nombre no puede tener más de 50 caracteres');
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre.trim())) {
            errores.push('El nombre solo puede contener letras');
        }
    }

    // Validar apellido (si se proporciona)
    if (apellido !== undefined) {
        if (apellido.trim() === '') {
            errores.push('El apellido no puede estar vacío');
        } else if (apellido.trim().length < 2) {
            errores.push('El apellido debe tener al menos 2 caracteres');
        } else if (apellido.trim().length > 50) {
            errores.push('El apellido no puede tener más de 50 caracteres');
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(apellido.trim())) {
            errores.push('El apellido solo puede contener letras');
        }
    }

    // Validar edad (si se proporciona)
    if (edad !== undefined) {
        const edadNum = parseInt(edad);
        if (isNaN(edadNum)) {
            errores.push('La edad debe ser un número válido');
        } else if (edadNum < 18) {
            errores.push('La edad debe ser mayor o igual a 18 años');
        } else if (edadNum > 100) {
            errores.push('La edad no puede ser mayor a 100 años');
        }
    }

    // Validar correo (si se proporciona)
    if (correo !== undefined) {
        if (correo.trim() === '') {
            errores.push('El correo electrónico no puede estar vacío');
        } else if (!validator.isEmail(correo)) {
            errores.push('El correo electrónico no es válido');
        }
    }

    // Validar contraseña (si se proporciona)
    if (password !== undefined && password !== '') {
        if (password.length < 6) {
            errores.push('La contraseña debe tener al menos 6 caracteres');
        } else if (password.length > 100) {
            errores.push('La contraseña no puede tener más de 100 caracteres');
        }
    }

    // Si hay errores, retornar respuesta 400
    if (errores.length > 0) {
        return res.status(400).json({
            success: false,
            mensaje: 'Errores de validación',
            errores
        });
    }

    // Si no hay errores, continuar
    next();
};

module.exports = {
    validarCreacionUsuario,
    validarActualizacionUsuario
};
