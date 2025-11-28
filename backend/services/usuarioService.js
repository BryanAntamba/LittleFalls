const Usuario = require('../models/Usuario');

/**
 * Service para gestión de usuarios (Admin)
 */
class UsuarioService {

    /**
     * Obtener todos los usuarios
     */
    async obtenerTodos() {
        try {
            const usuarios = await Usuario.find()
                .select('-password -codigoVerificacion -codigoExpiracion')
                .sort({ fechaRegistro: -1 })
                .lean() // Mejora el rendimiento
                .exec();

            return {
                success: true,
                usuarios
            };
        } catch (error) {
            console.error('Error en obtenerTodos:', error);
            return {
                success: false,
                mensaje: 'Error al obtener usuarios',
                error: error.message
            };
        }
    }

    /**
     * Obtener usuarios por tipo
     */
    async obtenerPorTipo(tipoUsuario) {
        try {
            const usuarios = await Usuario.find({ tipoUsuario })
                .select('-password -codigoVerificacion -codigoExpiracion')
                .sort({ fechaRegistro: -1 });

            return {
                success: true,
                usuarios
            };
        } catch (error) {
            return {
                success: false,
                mensaje: 'Error al obtener usuarios',
                error: error.message
            };
        }
    }

    /**
     * Crear usuario (veterinario o admin)
     */
    async crear(datos) {
        try {
            const { nombre, apellido, edad, correo, password, tipoUsuario } = datos;

            // Validar que el correo no exista
            const usuarioExistente = await Usuario.findOne({ correo: correo.toLowerCase() });
            if (usuarioExistente) {
                return {
                    success: false,
                    mensaje: 'El correo ya está registrado'
                };
            }

            // Validar tipo de usuario
            if (!['veterinario', 'admin'].includes(tipoUsuario)) {
                return {
                    success: false,
                    mensaje: 'Tipo de usuario no válido'
                };
            }

            // Hashear contraseña
            const bcrypt = require('bcrypt');
            const passwordHash = await bcrypt.hash(password, 10);

            // Crear usuario
            const nuevoUsuario = new Usuario({
                nombre,
                apellido,
                edad,
                correo: correo.toLowerCase(),
                password: passwordHash,
                tipoUsuario,
                verificado: true, // Los usuarios creados por admin están verificados
                activo: true
            });

            await nuevoUsuario.save();

            // Retornar sin la contraseña
            const usuarioRespuesta = nuevoUsuario.toObject();
            delete usuarioRespuesta.password;
            delete usuarioRespuesta.codigoVerificacion;
            delete usuarioRespuesta.codigoExpiracion;

            return {
                success: true,
                mensaje: 'Usuario creado exitosamente',
                usuario: usuarioRespuesta
            };
        } catch (error) {
            return {
                success: false,
                mensaje: 'Error al crear usuario',
                error: error.message
            };
        }
    }

    /**
     * Actualizar usuario
     */
    async actualizar(id, datos) {
        try {
            const { nombre, apellido, edad, correo, password } = datos;

            const usuario = await Usuario.findById(id);
            if (!usuario) {
                return {
                    success: false,
                    mensaje: 'Usuario no encontrado'
                };
            }

            // Verificar si el correo ya existe en otro usuario
            if (correo && correo !== usuario.correo) {
                const correoExistente = await Usuario.findOne({ 
                    correo: correo.toLowerCase(),
                    _id: { $ne: id }
                });
                if (correoExistente) {
                    return {
                        success: false,
                        mensaje: 'El correo ya está en uso por otro usuario'
                    };
                }
            }

            // Actualizar campos
            if (nombre) usuario.nombre = nombre;
            if (apellido) usuario.apellido = apellido;
            if (edad) usuario.edad = edad;
            if (correo) usuario.correo = correo.toLowerCase();

            // Si se proporciona nueva contraseña, hashearla
            if (password) {
                const bcrypt = require('bcrypt');
                usuario.password = await bcrypt.hash(password, 10);
            }

            await usuario.save();

            // Retornar sin datos sensibles
            const usuarioRespuesta = usuario.toObject();
            delete usuarioRespuesta.password;
            delete usuarioRespuesta.codigoVerificacion;
            delete usuarioRespuesta.codigoExpiracion;

            return {
                success: true,
                mensaje: 'Usuario actualizado exitosamente',
                usuario: usuarioRespuesta
            };
        } catch (error) {
            return {
                success: false,
                mensaje: 'Error al actualizar usuario',
                error: error.message
            };
        }
    }

    /**
     * Cambiar estado de usuario (activar/desactivar)
     */
    async cambiarEstado(id) {
        try {
            const usuario = await Usuario.findById(id);
            if (!usuario) {
                return {
                    success: false,
                    mensaje: 'Usuario no encontrado'
                };
            }

            usuario.activo = !usuario.activo;
            await usuario.save();

            return {
                success: true,
                mensaje: `Usuario ${usuario.activo ? 'activado' : 'desactivado'} exitosamente`,
                activo: usuario.activo
            };
        } catch (error) {
            return {
                success: false,
                mensaje: 'Error al cambiar estado del usuario',
                error: error.message
            };
        }
    }

    /**
     * Eliminar usuario
     */
    async eliminar(id) {
        try {
            const usuario = await Usuario.findByIdAndDelete(id);
            if (!usuario) {
                return {
                    success: false,
                    mensaje: 'Usuario no encontrado'
                };
            }

            return {
                success: true,
                mensaje: 'Usuario eliminado exitosamente'
            };
        } catch (error) {
            return {
                success: false,
                mensaje: 'Error al eliminar usuario',
                error: error.message
            };
        }
    }
}

module.exports = new UsuarioService();
