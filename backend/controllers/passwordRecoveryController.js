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

      // Validar que el correo sea solo @gmail.com o @hotmail.com
      const emailRegex = /^[^\s@]+@(gmail\.com|hotmail\.com)$/i;
      if (!emailRegex.test(correo)) {
        return res.status(400).json({
          success: false,
          mensaje: 'Solo se permite recuperación para correos de Gmail o Hotmail'
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

      // Validar formato de contraseña: solo letras y números, mínimo 8 caracteres
      const passwordRegex = /^[a-zA-Z0-9]{8,}$/;
      if (!passwordRegex.test(nuevaPassword)) {
        return res.status(400).json({
          success: false,
          mensaje: 'La contraseña debe contener solo letras y números, mínimo 8 caracteres'
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
