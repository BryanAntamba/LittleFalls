const jwt = require('jsonwebtoken');

/**
 * Servicio para manejo de JSON Web Tokens
 */
class JWTService {
    constructor() {
        // Clave secreta desde variables de entorno
        this.SECRET_KEY = process.env.JWT_SECRET || 'tu_clave_secreta_super_segura_cambiar_en_produccion';
        this.REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'tu_refresh_secret_super_segura';

        // Tiempos de expiración
        this.ACCESS_TOKEN_EXPIRE = '15m'; // 15 minutos
        this.REFRESH_TOKEN_EXPIRE = '7d';  // 7 días
    }

    /**
     * Generar Access Token (corta duración)
     * @param {Object} payload - Datos del usuario
     * @returns {string} Token JWT
     */
    generarAccessToken(payload) {
        const tokenPayload = {
            id: payload.id,
            correo: payload.correo,
            tipoUsuario: payload.tipoUsuario,
            tipo: 'access'
        };

        return jwt.sign(tokenPayload, this.SECRET_KEY, {
            expiresIn: this.ACCESS_TOKEN_EXPIRE,
            issuer: 'littlefalls-api',
            audience: 'littlefalls-app'
        });
    }

    /**
     * Generar Refresh Token (larga duración)
     * @param {Object} payload - Datos del usuario
     * @returns {string} Refresh token
     */
    generarRefreshToken(payload) {
        const tokenPayload = {
            id: payload.id,
            correo: payload.correo,
            tipo: 'refresh'
        };

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
