/**
 * Middleware global para manejo de errores
 */
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Error de validación de Mongoose
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            mensaje: 'Errores de validación',
            errores: errors
        });
    }

    // Error de duplicado en MongoDB
    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            mensaje: 'Ya existe un registro con esos datos',
            campo: Object.keys(err.keyPattern)[0]
        });
    }

    // Error de casting de MongoDB
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            mensaje: 'ID no válido'
        });
    }

    // Error genérico
    res.status(err.status || 500).json({
        success: false,
        mensaje: err.message || 'Error interno del servidor'
    });
};

module.exports = errorHandler;
