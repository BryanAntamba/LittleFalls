const validator = require('validator');

/**
 * Middleware de validación para creación de citas
 */
const validarCreacionCita = (req, res, next) => {
    const errores = [];
    const { 
        nombrePaciente, 
        apellidoPaciente, 
        correoPaciente, 
        telefonoPaciente, 
        nombreMascota, 
        edadMascota, 
        descripcion 
    } = req.body;

    // Validar nombre del paciente - solo letras
    if (!nombrePaciente || nombrePaciente.trim() === '') {
        errores.push('El nombre del paciente es obligatorio');
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombrePaciente.trim())) {
        errores.push('El nombre solo puede contener letras');
    } else if (nombrePaciente.trim().length < 2 || nombrePaciente.trim().length > 50) {
        errores.push('El nombre debe tener entre 2 y 50 caracteres');
    }

    // Validar apellido del paciente - solo letras
    if (!apellidoPaciente || apellidoPaciente.trim() === '') {
        errores.push('El apellido del paciente es obligatorio');
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(apellidoPaciente.trim())) {
        errores.push('El apellido solo puede contener letras');
    } else if (apellidoPaciente.trim().length < 2 || apellidoPaciente.trim().length > 50) {
        errores.push('El apellido debe tener entre 2 y 50 caracteres');
    }

    // Validar correo - solo @gmail.com o @hotmail.com
    if (!correoPaciente || correoPaciente.trim() === '') {
        errores.push('El correo electrónico es obligatorio');
    } else if (!validator.isEmail(correoPaciente)) {
        errores.push('El correo electrónico no es válido');
    } else {
        const correoLower = correoPaciente.toLowerCase();
        if (!correoLower.endsWith('@gmail.com') && !correoLower.endsWith('@hotmail.com')) {
            errores.push('El correo debe terminar en @gmail.com o @hotmail.com');
        }
    }

    // Validar teléfono - exactamente 10 dígitos
    if (!telefonoPaciente || telefonoPaciente.trim() === '') {
        errores.push('El teléfono es obligatorio');
    } else if (!/^\d{10}$/.test(telefonoPaciente.trim())) {
        errores.push('El teléfono debe tener exactamente 10 dígitos');
    }

    // Validar nombre de la mascota - solo letras
    if (!nombreMascota || nombreMascota.trim() === '') {
        errores.push('El nombre de la mascota es obligatorio');
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombreMascota.trim())) {
        errores.push('El nombre de la mascota solo puede contener letras');
    } else if (nombreMascota.trim().length < 2 || nombreMascota.trim().length > 50) {
        errores.push('El nombre de la mascota debe tener entre 2 y 50 caracteres');
    }

    // Validar edad de la mascota - máximo 20 años
    if (edadMascota === undefined || edadMascota === null) {
        errores.push('La edad de la mascota es obligatoria');
    } else {
        const edad = parseInt(edadMascota);
        if (isNaN(edad) || edad <= 0) {
            errores.push('La edad debe ser un número mayor a 0');
        } else if (edad > 20) {
            errores.push('La edad de la mascota no puede superar los 20 años');
        }
    }

    // Validar descripción - debe contener al menos una letra
    if (!descripcion || descripcion.trim() === '') {
        errores.push('La descripción es obligatoria');
    } else {
        // Permitir letras, números, espacios, comas y puntos
        if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,]+$/.test(descripcion.trim())) {
            errores.push('La descripción solo puede contener letras, números, espacios, comas y puntos');
        }
        // Verificar que contenga al menos una letra
        if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(descripcion)) {
            errores.push('La descripción debe contener al menos una letra');
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

/**
 * Middleware de validación para actualización de citas
 */
const validarActualizacionCita = (req, res, next) => {
    const errores = [];
    const { 
        nombrePaciente, 
        apellidoPaciente, 
        correoPaciente, 
        telefonoPaciente, 
        nombreMascota, 
        edadMascota, 
        descripcion 
    } = req.body;

    // Validar nombre del paciente si se proporciona
    if (nombrePaciente !== undefined) {
        if (nombrePaciente.trim() === '') {
            errores.push('El nombre del paciente no puede estar vacío');
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombrePaciente.trim())) {
            errores.push('El nombre solo puede contener letras');
        } else if (nombrePaciente.trim().length < 2 || nombrePaciente.trim().length > 50) {
            errores.push('El nombre debe tener entre 2 y 50 caracteres');
        }
    }

    // Validar apellido del paciente si se proporciona
    if (apellidoPaciente !== undefined) {
        if (apellidoPaciente.trim() === '') {
            errores.push('El apellido del paciente no puede estar vacío');
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(apellidoPaciente.trim())) {
            errores.push('El apellido solo puede contener letras');
        } else if (apellidoPaciente.trim().length < 2 || apellidoPaciente.trim().length > 50) {
            errores.push('El apellido debe tener entre 2 y 50 caracteres');
        }
    }

    // Validar correo si se proporciona
    if (correoPaciente !== undefined) {
        if (correoPaciente.trim() === '') {
            errores.push('El correo electrónico no puede estar vacío');
        } else if (!validator.isEmail(correoPaciente)) {
            errores.push('El correo electrónico no es válido');
        } else {
            const correoLower = correoPaciente.toLowerCase();
            if (!correoLower.endsWith('@gmail.com') && !correoLower.endsWith('@hotmail.com')) {
                errores.push('El correo debe terminar en @gmail.com o @hotmail.com');
            }
        }
    }

    // Validar teléfono si se proporciona
    if (telefonoPaciente !== undefined) {
        if (telefonoPaciente.trim() === '') {
            errores.push('El teléfono no puede estar vacío');
        } else if (!/^\d{10}$/.test(telefonoPaciente.trim())) {
            errores.push('El teléfono debe tener exactamente 10 dígitos');
        }
    }

    // Validar nombre de la mascota si se proporciona
    if (nombreMascota !== undefined) {
        if (nombreMascota.trim() === '') {
            errores.push('El nombre de la mascota no puede estar vacío');
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombreMascota.trim())) {
            errores.push('El nombre de la mascota solo puede contener letras');
        } else if (nombreMascota.trim().length < 2 || nombreMascota.trim().length > 50) {
            errores.push('El nombre de la mascota debe tener entre 2 y 50 caracteres');
        }
    }

    // Validar edad de la mascota si se proporciona
    if (edadMascota !== undefined) {
        const edad = parseInt(edadMascota);
        if (isNaN(edad) || edad <= 0) {
            errores.push('La edad debe ser un número mayor a 0');
        } else if (edad > 20) {
            errores.push('La edad de la mascota no puede superar los 20 años');
        }
    }

    // Validar descripción si se proporciona
    if (descripcion !== undefined && descripcion !== '') {
        if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,]+$/.test(descripcion.trim())) {
            errores.push('La descripción solo puede contener letras, números, espacios, comas y puntos');
        }
        if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(descripcion)) {
            errores.push('La descripción debe contener al menos una letra');
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
    validarCreacionCita,
    validarActualizacionCita
};
