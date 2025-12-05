const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');
const emailService = require('./emailService');

/**
 * Servicio de recuperación de contraseña
 */
class PasswordRecoveryService {

  /**
   * Solicitar recuperación de contraseña
   * Genera código y lo envía por email si el correo existe
   * @param {string} correo 
   * @returns {Object}
   */
  async solicitarRecuperacion(correo) {
    try {
      const correoNormalizado = correo.toLowerCase().trim();

      // Validar que el correo sea solo @gmail.com o @hotmail.com
      const emailRegex = /^[^\s@]+@(gmail\.com|hotmail\.com)$/i;
      if (!emailRegex.test(correoNormalizado)) {
        return {
          success: false,
          mensaje: 'Solo se permite recuperación para correos de Gmail o Hotmail'
        };
      }

      // Buscar usuario por correo
      const usuario = await Usuario.findOne({ correo: correoNormalizado });

      // Validar si el correo existe
      if (!usuario) {
        return {
          success: false,
          mensaje: 'No existe una cuenta asociada a este correo electrónico'
        };
      }

      // Verificar que el usuario esté activo
      if (!usuario.activo) {
        return {
          success: false,
          mensaje: 'Esta cuenta está desactivada. Contacta al administrador'
        };
      }

      // Generar código de 6 dígitos
      const codigoRecuperacion = this._generarCodigoRecuperacion();
      const codigoExpiracion = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

      // Guardar código en el usuario
      usuario.codigoRecuperacion = codigoRecuperacion;
      usuario.codigoRecuperacionExpiracion = codigoExpiracion;
      await usuario.save();

      // Enviar email con el código
      const emailEnviado = await emailService.enviarCodigoRecuperacion(
        correoNormalizado,
        usuario.nombre,
        codigoRecuperacion
      );

      if (!emailEnviado.success) {
        // Limpiar código si no se pudo enviar
        usuario.codigoRecuperacion = null;
        usuario.codigoRecuperacionExpiracion = null;
        await usuario.save();

        return {
          success: false,
          mensaje: 'Error al enviar el código. Por favor intenta de nuevo.'
        };
      }

      return {
        success: true,
        mensaje: 'Código de recuperación enviado a tu correo electrónico'
      };

    } catch (error) {
      console.error('Error al solicitar recuperación:', error);
      throw new Error('Error al procesar la solicitud de recuperación');
    }
  }

  /**
   * Verificar código de recuperación
   * @param {string} correo 
   * @param {string} codigo 
   * @returns {Object}
   */
  async verificarCodigoRecuperacion(correo, codigo) {
    try {
      const correoNormalizado = correo.toLowerCase().trim();

      // Buscar usuario
      const usuario = await Usuario.findOne({ correo: correoNormalizado });

      if (!usuario) {
        return {
          success: false,
          mensaje: 'Código inválido o expirado'
        };
      }

      // Verificar si hay código de recuperación
      if (!usuario.codigoRecuperacion) {
        return {
          success: false,
          mensaje: 'No hay solicitud de recuperación pendiente'
        };
      }

      // Verificar si el código expiró
      if (new Date() > usuario.codigoRecuperacionExpiracion) {
        // Limpiar código expirado
        usuario.codigoRecuperacion = null;
        usuario.codigoRecuperacionExpiracion = null;
        await usuario.save();

        return {
          success: false,
          mensaje: 'El código ha expirado. Solicita uno nuevo',
          codigoExpirado: true
        };
      }

      // Verificar si el código coincide
      if (usuario.codigoRecuperacion !== codigo.trim()) {
        return {
          success: false,
          mensaje: 'Código incorrecto'
        };
      }

      // Código válido
      return {
        success: true,
        mensaje: 'Código verificado. Puedes restablecer tu contraseña',
        tokenTemporal: this._generarTokenTemporal(usuario._id) // Token temporal para el siguiente paso
      };

    } catch (error) {
      console.error('Error al verificar código:', error);
      throw new Error('Error al verificar el código de recuperación');
    }
  }

  /**
   * Restablecer contraseña con código verificado
   * @param {string} correo 
   * @param {string} codigo 
   * @param {string} nuevaPassword 
   * @returns {Object}
   */
  async restablecerPassword(correo, codigo, nuevaPassword) {
    try {
      const correoNormalizado = correo.toLowerCase().trim();

      // Buscar usuario
      const usuario = await Usuario.findOne({ correo: correoNormalizado });

      if (!usuario) {
        return {
          success: false,
          mensaje: 'Solicitud inválida'
        };
      }

      // Verificar código nuevamente
      if (!usuario.codigoRecuperacion || usuario.codigoRecuperacion !== codigo.trim()) {
        return {
          success: false,
          mensaje: 'Código inválido'
        };
      }

      // Verificar expiración
      if (new Date() > usuario.codigoRecuperacionExpiracion) {
        usuario.codigoRecuperacion = null;
        usuario.codigoRecuperacionExpiracion = null;
        await usuario.save();

        return {
          success: false,
          mensaje: 'El código ha expirado. Solicita uno nuevo',
          codigoExpirado: true
        };
      }

      // Validar seguridad de la nueva contraseña
      if (!this._validarSeguridadPassword(nuevaPassword)) {
        return {
          success: false,
          mensaje: 'La contraseña debe contener solo letras y números, mínimo 8 caracteres'
        };
      }

      // Validar que la nueva contraseña sea diferente a la actual
      const esLaMismaPassword = await bcrypt.compare(nuevaPassword, usuario.password);
      if (esLaMismaPassword) {
        return {
          success: false,
          mensaje: 'La nueva contraseña debe ser diferente a la contraseña actual'
        };
      }

      // Encriptar nueva contraseña
      const passwordEncriptado = await bcrypt.hash(nuevaPassword, 12);

      // Actualizar contraseña y limpiar código
      usuario.password = passwordEncriptado;
      usuario.codigoRecuperacion = null;
      usuario.codigoRecuperacionExpiracion = null;
      await usuario.save();

      // Enviar email de confirmación
      await emailService.enviarConfirmacionCambioPassword(
        correoNormalizado,
        usuario.nombre
      );

      return {
        success: true,
        mensaje: 'Contraseña restablecida exitosamente. Ya puedes iniciar sesión'
      };

    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      throw new Error('Error al restablecer la contraseña');
    }
  }

  /**
   * Generar código de recuperación de 6 dígitos
   * @private
   * @returns {string}
   */
  _generarCodigoRecuperacion() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generar token temporal (simplificado, en producción usar JWT)
   * @private
   * @param {string} userId 
   * @returns {string}
   */
  _generarTokenTemporal(userId) {
    // En producción, esto debería ser un JWT con expiración corta
    return Buffer.from(`${userId}-${Date.now()}`).toString('base64');
  }

  /**
   * Validar seguridad de contraseña
   * @private
   * @param {string} password 
   * @returns {boolean}
   */
  _validarSeguridadPassword(password) {
    // Solo letras y números, mínimo 8 caracteres
    const formatoValido = /^[a-zA-Z0-9]{8,}$/.test(password);
    const tieneLetra = /[a-zA-Z]/.test(password);
    const tieneNumero = /[0-9]/.test(password);
    
    return formatoValido && tieneLetra && tieneNumero;
  }

  /**
   * Simular delay para evitar timing attacks
   * @private
   */
  async _simularDelay() {
    const delay = Math.floor(Math.random() * 500) + 200; // 200-700ms
    return new Promise(resolve => setTimeout(resolve, delay));
  }

}

module.exports = new PasswordRecoveryService();
