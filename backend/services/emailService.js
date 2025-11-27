const nodemailer = require('nodemailer');

/**
 * Servicio de Email - Envío de correos electrónicos
 */
class EmailService {
    constructor() {
        // Configurar transporter de Gmail
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    /**
     * Genera un código de verificación de 6 dígitos
     */
    generarCodigoVerificacion() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    /**
     * Plantilla HTML para email de verificación
     */
    plantillaVerificacion(nombre, codigo) {
        return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verificación de Cuenta - LittleFalls</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    
                    <!-- Header con colores de la veterinaria -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #00bfa6 0%, #00a693 100%); padding: 40px 20px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                                🐾 LittleFalls
                            </h1>
                            <p style="color: #E0F7F4; margin: 10px 0 0 0; font-size: 14px;">
                                Clínica Veterinaria
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Contenido principal -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #00bfa6; margin: 0 0 20px 0; font-size: 24px;">
                                ¡Hola ${nombre}!
                            </h2>
                            
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Gracias por registrarte en <strong>LittleFalls</strong>. Para completar tu registro y verificar que eres una persona real, necesitamos que ingreses el siguiente código de verificación:
                            </p>
                            
                            <!-- Código de verificación -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <div style="background: linear-gradient(135deg, #00bfa6 0%, #00d4b8 100%); border-radius: 10px; padding: 25px; display: inline-block; box-shadow: 0 4px 15px rgba(0, 191, 166, 0.3);">
                                            <p style="color: #ffffff; margin: 0 0 10px 0; font-size: 14px; font-weight: 600; letter-spacing: 1px;">
                                                TU CÓDIGO DE VERIFICACIÓN
                                            </p>
                                            <p style="color: #ffffff; margin: 0; font-size: 42px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                                ${codigo}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                                <strong>Importante:</strong> Este código es válido por <strong>15 minutos</strong>. Si no solicitaste este registro, ignora este correo.
                            </p>
                            
                            <div style="background-color: #E0F7F4; border-left: 4px solid #00bfa6; padding: 15px; margin: 20px 0; border-radius: 5px;">
                                <p style="color: #00a693; margin: 0; font-size: 14px;">
                                    💡 <strong>Consejo:</strong> No compartas este código con nadie. Nuestro equipo nunca te pedirá este código por teléfono o email.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #F5F5F5; padding: 30px; text-align: center; border-top: 1px solid #E0E0E0;">
                            <p style="color: #666666; margin: 0 0 10px 0; font-size: 14px;">
                                ¿Necesitas ayuda? Contáctanos
                            </p>
                            <p style="color: #00bfa6; margin: 0 0 20px 0; font-size: 14px; font-weight: bold;">
                                📧 stivoter1234567@gmail.com
                            </p>
                            <p style="color: #999999; margin: 0; font-size: 12px;">
                                © ${new Date().getFullYear()} LittleFalls - Clínica Veterinaria. Todos los derechos reservados.
                            </p>
                            <p style="color: #999999; margin: 10px 0 0 0; font-size: 12px;">
                                Cuidando a tus mascotas con amor 🐶🐱
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `;
    }

    /**
     * Enviar email de verificación
     */
    async enviarCodigoVerificacion(destinatario, nombre, codigo) {
        try {
            const mailOptions = {
                from: {
                    name: 'LittleFalls Veterinaria',
                    address: process.env.EMAIL_USER
                },
                to: destinatario,
                subject: '🐾 Verifica tu cuenta en LittleFalls',
                html: this.plantillaVerificacion(nombre, codigo)
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email enviado:', info.messageId);
            
            return {
                success: true,
                mensaje: 'Código de verificación enviado al correo'
            };

        } catch (error) {
            console.error('❌ Error al enviar email:', error);
            return {
                success: false,
                mensaje: 'Error al enviar el correo de verificación'
            };
        }
    }

    /**
     * Verificar conexión con el servidor de correo
     */
    async verificarConexion() {
        try {
            await this.transporter.verify();
            console.log('✅ Servidor de correo conectado y listo');
            return true;
        } catch (error) {
            console.error('❌ Error de conexión con servidor de correo:', error);
            return false;
        }
    }
}

module.exports = new EmailService();
