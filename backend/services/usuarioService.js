// Importar modelo de Usuario desde MongoDB
const Usuario = require('../models/Usuario');

/**
 * Servicio de lógica de negocio para gestión de usuarios
 * Maneja operaciones CRUD de usuarios del sistema
 * Solo admin tiene acceso a estas funcionalidades
 */
class UsuarioService {

    /**
     * Obtener todos los usuarios del sistema
     * Excluye datos sensibles como password y códigos de verificación
     * @returns {Object} Resultado con array de usuarios
     */
    async obtenerTodos() {
        try {
            // find() sin parámetros trae todos los documentos
            const usuarios = await Usuario.find()
                // select() excluye campos sensibles (- significa excluir)
                .select('-password -codigoVerificacion -codigoExpiracion')
                // Ordenar por fecha de registro descendente (más recientes primero)
                .sort({ fechaRegistro: -1 })
                // lean() retorna objetos JS planos (más rápido, no son documentos Mongoose)
                .lean()
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
     * Obtener usuarios filtrados por tipo
     * Tipos válidos: veterinario, admin, paciente
     * @param {string} tipoUsuario - Tipo de usuario a filtrar
     * @returns {Object} Resultado con array de usuarios del tipo especificado
     */
    async obtenerPorTipo(tipoUsuario) {
        try {
            // Filtrar solo usuarios del tipo especificado
            const usuarios = await Usuario.find({ tipoUsuario })
                // Excluir campos sensibles
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
     * Crear un nuevo usuario (veterinario o admin)
     * Solo admin puede crear usuarios desde este endpoint
     * Los pacientes se registran por el endpoint público
     * @param {Object} datos - Datos del nuevo usuario
     * @param {string} datos.nombre - Nombre del usuario
     * @param {string} datos.apellido - Apellido del usuario
     * @param {number} datos.edad - Edad del usuario
     * @param {string} datos.correo - Email del usuario
     * @param {string} datos.password - Contraseña sin hashear
     * @param {string} datos.tipoUsuario - Tipo: veterinario o admin
     * @returns {Object} Resultado con usuario creado
     */
    async crear(datos) {
        try {
            const { nombre, apellido, edad, correo, password, tipoUsuario } = datos;

            // Validar que el correo no exista en la base de datos
            // toLowerCase() para evitar duplicados por mayúsculas/minúsculas
            const usuarioExistente = await Usuario.findOne({ correo: correo.toLowerCase() });
            if (usuarioExistente) {
                return {
                    success: false,
                    mensaje: 'El correo ya está registrado'
                };
            }

            // Validar tipo de usuario - solo veterinario o admin permitidos
            // Los pacientes usan el endpoint de registro público
            if (!['veterinario', 'admin'].includes(tipoUsuario)) {
                return {
                    success: false,
                    mensaje: 'Tipo de usuario no válido'
                };
            }

            // Hashear contraseña con bcrypt (10 rounds de salt)
            const bcrypt = require('bcrypt');
            const passwordHash = await bcrypt.hash(password, 10);

            // Crear nuevo documento de usuario
            const nuevoUsuario = new Usuario({
                nombre,
                apellido,
                edad,
                correo: correo.toLowerCase(),  // Guardar en minúsculas
                password: passwordHash,
                tipoUsuario,
                verificado: true,  // Los usuarios creados por admin ya están verificados
                activo: true       // Por defecto activos
            });

            // Guardar en la base de datos
            await nuevoUsuario.save();

            // Preparar respuesta sin datos sensibles
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
     * Actualizar información de un usuario existente
     * Permite actualizar nombre, apellido, edad, correo y password
     * @param {string} id - ID del usuario a actualizar
     * @param {Object} datos - Campos a actualizar
     * @param {string} datos.nombre - Nuevo nombre (opcional)
     * @param {string} datos.apellido - Nuevo apellido (opcional)
     * @param {number} datos.edad - Nueva edad (opcional)
     * @param {string} datos.correo - Nuevo correo (opcional)
     * @param {string} datos.password - Nueva contraseña (opcional)
     * @returns {Object} Resultado con usuario actualizado
     */
    async actualizar(id, datos) {
        try {
            const { nombre, apellido, edad, correo, password } = datos;

            // Buscar usuario por ID
            const usuario = await Usuario.findById(id);
            if (!usuario) {
                return {
                    success: false,
                    mensaje: 'Usuario no encontrado'
                };
            }

            // Si se intenta cambiar el correo, verificar que no esté en uso
            if (correo && correo !== usuario.correo) {
                const correoExistente = await Usuario.findOne({ 
                    correo: correo.toLowerCase(),
                    _id: { $ne: id }  // $ne = not equal (excluir el usuario actual)
                });
                if (correoExistente) {
                    return {
                        success: false,
                        mensaje: 'El correo ya está en uso por otro usuario'
                    };
                }
            }

            // Actualizar solo los campos proporcionados (actualización parcial)
            if (nombre) usuario.nombre = nombre;
            if (apellido) usuario.apellido = apellido;
            if (edad) usuario.edad = edad;
            if (correo) usuario.correo = correo.toLowerCase();

            // Si se proporciona nueva contraseña, hashearla antes de guardar
            if (password) {
                const bcrypt = require('bcrypt');
                usuario.password = await bcrypt.hash(password, 10);
            }

            // Guardar cambios en la base de datos
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
     * Cambiar estado de un usuario (activar/desactivar)
     * Alterna el valor del campo activo
     * Útil para suspender cuentas sin eliminarlas permanentemente
     * @param {string} id - ID del usuario
     * @returns {Object} Resultado con nuevo estado
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

            // Alternar estado: true -> false, false -> true
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
     * Eliminar un usuario del sistema permanentemente
     * Operación irreversible - usar con precaución
     * @param {string} id - ID del usuario a eliminar
     * @returns {Object} Resultado confirmando eliminación
     */
    async eliminar(id) {
        try {
            // findByIdAndDelete busca y elimina en una operación atómica
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

// Exportar instancia única del servicio (Singleton)
module.exports = new UsuarioService();
