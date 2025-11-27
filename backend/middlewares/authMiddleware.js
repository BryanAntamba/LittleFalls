/**
 * Middleware para verificar autenticación (preparado para JWT)
 * Por ahora es un placeholder para futuras implementaciones
 */
const verificarAutenticacion = (req, res, next) => {
    // TODO: Implementar verificación de JWT cuando se implemente
    // const token = req.headers.authorization?.split(' ')[1];
    // if (!token) {
    //     return res.status(401).json({ success: false, mensaje: 'No autorizado' });
    // }
    next();
};

/**
 * Middleware para verificar roles específicos
 */
const verificarRol = (...rolesPermitidos) => {
    return (req, res, next) => {
        // TODO: Implementar verificación de rol desde JWT
        // Por ahora es un placeholder
        next();
    };
};

module.exports = {
    verificarAutenticacion,
    verificarRol
};
