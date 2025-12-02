const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');
const emailService = require('./emailService');
const jwtService = require('./jwtService');

/**
 * Servicio de autenticación - Lógica de negocio
 */
class AuthService {
  
  /**
   * Iniciar sesión
   * @param {string} correo 
   * @param {string} password 
   * @returns {Object} { success, mensaje, usuario, accessToken, refreshToken }
   */
  async login(correo, password) {
    try {
      // Normalizar correo
      const correoNormalizado = correo.toLowerCase().trim();

      // Buscar usuario por correo (sin filtrar por tipo)
      const usuario = await Usuario.findOne({ 
        correo: correoNormalizado
      });

      // Validar existencia del usuario
      if (!usuario) {
        return { 
          success: false, 
          mensaje: 'Credenciales incorrectas'
        };
      }

      // Validar si el usuario está activo
      if (!usuario.activo) {
        return { 
          success: false, 
          mensaje: 'Usuario desactivado. Contacte al administrador'
        };
      }

      // Validar si el usuario está verificado
      if (!usuario.verificado) {
        return { 
          success: false, 
          mensaje: 'Cuenta no verificada. Por favor verifica tu correo electrónico'
        };
      }

      // Verificar contraseña encriptada
      const passwordValido = await bcrypt.compare(password, usuario.password);
      
      if (!passwordValido) {
        return { 
          success: false, 
          mensaje: 'Credenciales incorrectas'
        };
      }

      // Datos del usuario para el token
      const usuarioData = {
        id: usuario._id,
        correo: usuario.correo,
        tipoUsuario: usuario.tipoUsuario
      };

      // Generar tokens JWT
      const { accessToken, refreshToken } = jwtService.generarTokens(usuarioData);

      // Login exitoso - retornar datos seguros con tokens
      return { 
        success: true,
        mensaje: 'Login exitoso',
        usuario: {
          id: usuario._id,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          correo: usuario.correo,
          tipoUsuario: usuario.tipoUsuario,
          fechaRegistro: usuario.fechaRegistro
        },
        accessToken,
        refreshToken
      };

    } catch (error) {
      console.error('Error en login:', error);
      throw new Error('Error en el proceso de autenticación');
    }
  }

  /**
   * Registrar nuevo usuario (solo pacientes)
   * @param {Object} datos - { nombre, apellido, edad, correo, password }
   * @returns {Object} { success, mensaje, usuario }
   */
  async registro(datos) {
    try {
      const { nombre, apellido, edad, correo, password } = datos;

      // Normalizar correo
      const correoNormalizado = correo.toLowerCase().trim();

      // Validar que el correo no exista (en cualquier tipo de usuario)
      const usuarioExistente = await Usuario.findOne({ 
        correo: correoNormalizado 
      });
      
      if (usuarioExistente) {
        return { 
          success: false, 
          mensaje: 'El correo ya está registrado'
        };
      }

      // Validación adicional de seguridad de contraseña
      if (!this._validarSeguridadPassword(password)) {
        return {
          success: false,
          mensaje: 'La contraseña no cumple con los requisitos de seguridad'
        };
      }

      // Encriptar contraseña con salt rounds de 12 (más seguro)
      const passwordEncriptado = await bcrypt.hash(password, 12);

      // Generar código de verificación
      const codigoVerificacion = emailService.generarCodigoVerificacion();
      const codigoExpiracion = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

      // Crear nuevo usuario (SIEMPRE paciente en registro público)
      const nuevoUsuario = new Usuario({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        edad: parseInt(edad),
        correo: correoNormalizado,
        password: passwordEncriptado,
        tipoUsuario: 'paciente',
        activo: true,
        verificado: false,
        codigoVerificacion,
        codigoExpiracion
      });

      await nuevoUsuario.save();

      // Enviar email de verificación
      const emailEnviado = await emailService.enviarCodigoVerificacion(
        correoNormalizado,
        nombre.trim(),
        codigoVerificacion
      );

      if (!emailEnviado.success) {
        // Si falla el email, eliminar el usuario creado
        await Usuario.deleteOne({ _id: nuevoUsuario._id });
        return {
          success: false,
          mensaje: 'Error al enviar el código de verificación. Por favor intenta de nuevo.'
        };
      }

      // Retornar datos del usuario registrado (sin password ni código)
      return { 
        success: true,
        mensaje: 'Registro exitoso. Revisa tu correo para verificar tu cuenta',
        usuario: {
          id: nuevoUsuario._id,
          nombre: nuevoUsuario.nombre,
          apellido: nuevoUsuario.apellido,
          correo: nuevoUsuario.correo,
          tipoUsuario: nuevoUsuario.tipoUsuario
        },
        requiereVerificacion: true
      };

    } catch (error) {
      console.error('Error en registro:', error);
      
      // Manejo específico de errores de Mongoose
      if (error.name === 'ValidationError') {
        const errores = Object.values(error.errors).map(e => e.message);
        return { 
          success: false, 
          mensaje: 'Errores de validación',
          errores 
        };
      }
      
      throw new Error('Error en el proceso de registro');
    }
  }

  /**
   * Verificar código de verificación
   * @param {string} correo 
   * @param {string} codigo 
   * @returns {Object}
   */
  async verificarCodigo(correo, codigo) {
    try {
      const correoNormalizado = correo.toLowerCase().trim();

      // Buscar usuario
      const usuario = await Usuario.findOne({ correo: correoNormalizado });

      if (!usuario) {
        return {
          success: false,
          mensaje: 'Usuario no encontrado'
        };
      }

      // Verificar si ya está verificado
      if (usuario.verificado) {
        return {
          success: false,
          mensaje: 'Esta cuenta ya ha sido verificada'
        };
      }

      // Verificar si el código existe
      if (!usuario.codigoVerificacion) {
        return {
          success: false,
          mensaje: 'No hay código de verificación pendiente'
        };
      }

      // Verificar si el código expiró
      if (new Date() > usuario.codigoExpiracion) {
        return {
          success: false,
          mensaje: 'El código de verificación ha expirado. Solicita uno nuevo',
          codigoExpirado: true
        };
      }

      // Verificar si el código coincide
      if (usuario.codigoVerificacion !== codigo.trim()) {
        return {
          success: false,
          mensaje: 'Código de verificación incorrecto'
        };
      }

      // Activar usuario y limpiar código
      usuario.verificado = true;
      usuario.codigoVerificacion = null;
      usuario.codigoExpiracion = null;
      await usuario.save();

      return {
        success: true,
        mensaje: 'Cuenta verificada exitosamente. Ya puedes iniciar sesión',
        usuario: {
          id: usuario._id,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          correo: usuario.correo,
          tipoUsuario: usuario.tipoUsuario
        }
      };

    } catch (error) {
      console.error('Error en verificación:', error);
      throw new Error('Error al verificar el código');
    }
  }

  /**
   * Reenviar código de verificación
   * @param {string} correo 
   * @returns {Object}
   */
  async reenviarCodigo(correo) {
    try {
      const correoNormalizado = correo.toLowerCase().trim();

      // Buscar usuario
      const usuario = await Usuario.findOne({ correo: correoNormalizado });

      if (!usuario) {
        return {
          success: false,
          mensaje: 'Usuario no encontrado'
        };
      }

      // Verificar si ya está verificado
      if (usuario.verificado) {
        return {
          success: false,
          mensaje: 'Esta cuenta ya ha sido verificada'
        };
      }

      // Generar nuevo código
      const codigoVerificacion = emailService.generarCodigoVerificacion();
      const codigoExpiracion = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

      usuario.codigoVerificacion = codigoVerificacion;
      usuario.codigoExpiracion = codigoExpiracion;
      await usuario.save();

      // Enviar email
      const emailEnviado = await emailService.enviarCodigoVerificacion(
        correoNormalizado,
        usuario.nombre,
        codigoVerificacion
      );

      if (!emailEnviado.success) {
        return {
          success: false,
          mensaje: 'Error al enviar el código. Por favor intenta de nuevo.'
        };
      }

      return {
        success: true,
        mensaje: 'Nuevo código enviado a tu correo'
      };

    } catch (error) {
      console.error('Error al reenviar código:', error);
      throw new Error('Error al reenviar código de verificación');
    }
  }

  /**
   * Validar seguridad de contraseña
   * @private
   * @param {string} password 
   * @returns {boolean}
   */
  _validarSeguridadPassword(password) {
    // Al menos 6 caracteres, una letra y un número
    const tieneLetra = /[a-zA-Z]/.test(password);
    const tieneNumero = /[0-9]/.test(password);
    const longitudValida = password.length >= 6 && password.length <= 100;
    
    return tieneLetra && tieneNumero && longitudValida;
  }

  /**
   * Buscar usuario por ID (útil para otros servicios)
   * @param {string} id 
   * @returns {Object|null}
   */
  async buscarPorId(id) {
    try {
      const usuario = await Usuario.findById(id).select('-password');
      return usuario;
    } catch (error) {
      console.error('Error al buscar usuario:', error);
      return null;
    }
  }

  /**
   * Buscar usuario por correo (útil para otros servicios)
   * @param {string} correo 
   * @returns {Object|null}
   */
  async buscarPorCorreo(correo) {
    try {
      const usuario = await Usuario.findOne({ 
        correo: correo.toLowerCase().trim() 
      }).select('-password');
      return usuario;
    } catch (error) {
      console.error('Error al buscar usuario:', error);
      return null;
    }
  }

}

module.exports = new AuthService();

