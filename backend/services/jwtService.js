// Importación de jsonwebtoken para crear y verificar tokens JWT
const jwt = require('jsonwebtoken');

/**
 * Servicio para manejo de JSON Web Tokens (JWT)
 * Gestiona la creación, verificación y renovación de tokens de autenticación
 * 
 * JWT se usa para:
 * - Autenticar usuarios sin guardar sesiones en el servidor (stateless)
 * - Transmitir información de forma segura entre cliente y servidor
 * - Implementar sistema de refresh tokens para renovar acceso
 */
class JWTService {
    constructor() {
        // ========== CLAVES SECRETAS ==========
        // Clave para firmar Access Tokens (tokens de corta duración)
        // process.env.JWT_SECRET viene del archivo .env
        // || proporciona un valor por defecto si no existe la variable
        this.SECRET_KEY = process.env.JWT_SECRET || 'tu_clave_secreta_super_segura_cambiar_en_produccion';
        
        // Clave diferente para Refresh Tokens (mayor seguridad)
        this.REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'tu_refresh_secret_super_segura';

        // ========== TIEMPOS DE EXPIRACIÓN ==========
        // Access Token: corta duración para minimizar riesgo si es robado
        this.ACCESS_TOKEN_EXPIRE = '15m'; // 15 minutos
        
        // Refresh Token: larga duración para no requerir login frecuente
        this.REFRESH_TOKEN_EXPIRE = '7d';  // 7 días
    }

    /**
     * Genera un Access Token (token de corta duración)
     * Se usa para autenticar peticiones al API
     * Expira en 15 minutos para mayor seguridad
     * 
     * @param {Object} payload - Datos del usuario a incluir en el token
     * @param {string} payload.id - ID del usuario
     * @param {string} payload.correo - Email del usuario
     * @param {string} payload.tipoUsuario - Rol (paciente, veterinario, admin)
     * @returns {string} Token JWT firmado
     */
    generarAccessToken(payload) {
        // Construir payload del token con información esencial
        const tokenPayload = {
            id: payload.id,                    // ID del usuario para identificarlo
            correo: payload.correo,            // Email para validaciones
            tipoUsuario: payload.tipoUsuario,  // Rol para control de acceso
            tipo: 'access'                     // Marca que es un access token
        };

        // jwt.sign() crea y firma el token
        // Parámetros:
        // 1. tokenPayload = datos a codificar
        // 2. this.SECRET_KEY = clave para firmar
        // 3. opciones = configuración adicional
        return jwt.sign(tokenPayload, this.SECRET_KEY, {
            expiresIn: this.ACCESS_TOKEN_EXPIRE,  // Tiempo de expiración
            issuer: 'littlefalls-api',            // Quién emitió el token
            audience: 'littlefalls-app'           // Para quién es el token
        });
    }

    /**
     * Genera un Refresh Token (token de larga duración)
     * Se usa solo para renovar Access Tokens expirados
     * Expira en 7 días
     * Contiene menos información por seguridad
     * 
     * @param {Object} payload - Datos mínimos del usuario
     * @param {string} payload.id - ID del usuario
     * @param {string} payload.correo - Email del usuario
     * @returns {string} Refresh token JWT firmado
     */
    generarRefreshToken(payload) {
        // Payload más simple para refresh token (menos datos = más seguro)
        const tokenPayload = {
            id: payload.id,
            correo: payload.correo,
            tipo: 'refresh'  // Marca que es un refresh token
        };

        // Firmar con clave diferente para mayor seguridad
        return jwt.sign(tokenPayload, this.REFRESH_SECRET, {
            expiresIn: this.REFRESH_TOKEN_EXPIRE,
            issuer: 'littlefalls-api',
            audience: 'littlefalls-app'
        });
    }

    /**
     * Generar ambos tokens
     * @param {Object} payload 
     * @returns {Object} { accessToken, refreshToken }
     */
    generarTokens(payload) {
        return {
            accessToken: this.generarAccessToken(payload),
            refreshToken: this.generarRefreshToken(payload)
        };
    }

    /**
     * Verificar Access Token
     * @param {string} token 
     * @returns {Object|null} Payload del token o null si es inválido
     */
    verificarAccessToken(token) {
        try {
            const decoded = jwt.verify(token, this.SECRET_KEY, {
                issuer: 'littlefalls-api',
                audience: 'littlefalls-app'
            });

            if (decoded.tipo !== 'access') {
                throw new Error('Token inválido');
            }

            return decoded;
        } catch (error) {
            console.error('Error al verificar access token:', error.message);
            return null;
        }
    }

    /**
     * Verificar Refresh Token
     * @param {string} token 
     * @returns {Object|null} Payload del token o null si es inválido
     */
    verificarRefreshToken(token) {
        try {
            const decoded = jwt.verify(token, this.REFRESH_SECRET, {
                issuer: 'littlefalls-api',
                audience: 'littlefalls-app'
            });

            if (decoded.tipo !== 'refresh') {
                throw new Error('Token inválido');
            }

            return decoded;
        } catch (error) {
            console.error('Error al verificar refresh token:', error.message);
            return null;
        }
    }

    /**
     * Decodificar token sin verificar (útil para debugging)
     * @param {string} token 
     * @returns {Object|null}
     */
    decodificarToken(token) {
        try {
            return jwt.decode(token);
        } catch (error) {
            return null;
        }
    }

    /**
     * Verificar si un token está expirado
     * @param {string} token 
     * @returns {boolean}
     */
    estaExpirado(token) {
        const decoded = this.decodificarToken(token);
        if (!decoded || !decoded.exp) return true;

        const ahora = Math.floor(Date.now() / 1000);
        return decoded.exp < ahora;
    }
}

module.exports = new JWTService();
