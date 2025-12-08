/**
 * Middleware global para manejo centralizado de errores
 * Se ejecuta cuando cualquier ruta o middleware anterior lanza un error
 * Proporciona respuestas consistentes y amigables al cliente
 * 
 * IMPORTANTE: Debe registrarse DESPUÉS de todas las rutas en index.js
 * 
 * @param {Error} err - Objeto de error capturado
 * @param {Request} req - Objeto de petición HTTP
 * @param {Response} res - Objeto de respuesta HTTP
 * @param {Function} next - Función para pasar al siguiente middleware
 */
const errorHandler = (err, req, res, next) => {
    // Registrar error en consola para debugging
    // En producción podría enviarse a servicio de logging
    console.error('Error:', err);

    // ========== ERROR DE VALIDACIÓN DE MONGOOSE ==========
    // Ocurre cuando los datos no cumplen el esquema del modelo
    // Ejemplo: campo requerido faltante, tipo de dato incorrecto
    if (err.name === 'ValidationError') {
        // Object.values() extrae los valores del objeto de errores
        // map() transforma cada error en su mensaje
        const errors = Object.values(err.errors).map(e => e.message);
        
        // Retornar código 400 (Bad Request) con lista de errores
        return res.status(400).json({
            success: false,
            mensaje: 'Errores de validación',
            errores: errors  // Array de mensajes de error
        });
    }

    // ========== ERROR DE DUPLICADO (UNIQUE CONSTRAINT) ==========
    // Ocurre cuando se intenta insertar un valor duplicado en campo único
    // Ejemplo: registrar correo que ya existe
    // err.code === 11000 es el código de MongoDB para duplicate key
    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            mensaje: 'Ya existe un registro con esos datos',
            // err.keyPattern contiene el campo que causó el error
            campo: Object.keys(err.keyPattern)[0]  // Obtener nombre del campo
        });
    }

    // ========== ERROR DE CASTING ==========
    // Ocurre cuando se intenta convertir un valor a un tipo incorrecto
    // Ejemplo: pasar "abc" como ID cuando espera ObjectId de MongoDB
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            mensaje: 'ID no válido'
        });
    }

    // ========== ERROR GENÉRICO ==========
    // Para cualquier otro tipo de error no manejado específicamente
    // err.status || 500 = usar código de estado del error o 500 por defecto
    res.status(err.status || 500).json({
        success: false,
        mensaje: err.message || 'Error interno del servidor'
    });
};

// Exportar middleware para usarlo en index.js
module.exports = errorHandler;
