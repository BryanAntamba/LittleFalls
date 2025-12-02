const passwordRecoveryService = require('../services/passwordRecoveryService');

/**
 * Controller para recuperación de contraseña
 */
class PasswordRecoveryController {

  /**
   * POST /api/password-recovery/solicitar
   * Solicitar código de recuperación
   */
  async solicitarRecuperacion(req, res, next) {
    try {
      const { correo } = req.body;

      // Validar que venga el correo
      if (!correo) {
        return res.status(400).json({
          success: false,
          mensaje: 'El correo es requerido'
        });
      }

      // Validar formato de correo
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(correo)) {
        return res.status(400).json({
          success: false,
          mensaje: 'Formato de correo inválido'
        });
      }

      const resultado = await passwordRecoveryService.solicitarRecuperacion(correo);

      // Si el correo no existe, retornar error 404
      if (!resultado.success) {
        return res.status(404).json(resultado);
      }

      res.json(resultado);

    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/password-recovery/verificar-codigo
   * Verificar código de recuperación
   */
  async verificarCodigo(req, res, next) {
    try {
      const { correo, codigo } = req.body;

      // Validar campos requeridos
      if (!correo || !codigo) {
        return res.status(400).json({
          success: false,
          mensaje: 'Correo y código son requeridos'
        });
      }

      // Validar formato del código (6 dígitos)
      if (!/^\d{6}$/.test(codigo)) {
        return res.status(400).json({
          success: false,
          mensaje: 'El código debe tener 6 dígitos'
        });
      }

      const resultado = await passwordRecoveryService.verificarCodigoRecuperacion(correo, codigo);

      if (!resultado.success) {
        return res.status(400).json(resultado);
      }

      res.json(resultado);

    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/password-recovery/restablecer
   * Restablecer contraseña
   */
  async restablecerPassword(req, res, next) {
    try {
      const { correo, codigo, nuevaPassword } = req.body;

      // Validar campos requeridos
      if (!correo || !codigo || !nuevaPassword) {
        return res.status(400).json({
          success: false,
          mensaje: 'Todos los campos son requeridos'
        });
      }

      // Validar formato del código
      if (!/^\d{6}$/.test(codigo)) {
        return res.status(400).json({
          success: false,
          mensaje: 'Código inválido'
        });
      }

      // Validar longitud de contraseña
      if (nuevaPassword.length < 6) {
        return res.status(400).json({
          success: false,
          mensaje: 'La contraseña debe tener al menos 6 caracteres'
        });
      }

      const resultado = await passwordRecoveryService.restablecerPassword(
        correo, 
        codigo, 
        nuevaPassword
      );

      if (!resultado.success) {
        return res.status(400).json(resultado);
      }

      res.json(resultado);

    } catch (error) {
      next(error);
    }
  }

}

module.exports = new PasswordRecoveryController();
