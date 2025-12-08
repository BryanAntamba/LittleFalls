// Importación del decorador Injectable para inyección de dependencias
import { Injectable } from '@angular/core';

// Decorador que marca esta clase como servicio inyectable
// providedIn: 'root' = singleton global en toda la aplicación
@Injectable({
  providedIn: 'root'
})
export class AlertService {

  /**
   * Muestra una alerta personalizada tipo toast (notificación temporal)
   * Incluye icono, animaciones y auto-cierre
   * @param message - Mensaje a mostrar
   * @param type - Tipo de alerta (success, error, warning, info)
   * @param duration - Tiempo en ms antes de auto-cerrar (default 4000ms)
   */
  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration: number = 4000) {
    // Crear elemento div para contener la alerta
    const alertDiv = document.createElement('div');
    // Asignar clases CSS para estilo y tipo de alerta
    alertDiv.className = `custom-alert custom-alert-${type}`;
    
    // Objeto con iconos FontAwesome para cada tipo de alerta
    const icons = {
      success: '<i class="fa-solid fa-circle-check"></i>', // Icono de checkmark
      error: '<i class="fa-solid fa-circle-xmark"></i>',   // Icono de X
      warning: '<i class="fa-solid fa-triangle-exclamation"></i>', // Icono de advertencia
      info: '<i class="fa-solid fa-circle-info"></i>'      // Icono de información
    };

    // Construir estructura HTML de la alerta con template literals
    alertDiv.innerHTML = `
      <div class="custom-alert-content">
        <div class="custom-alert-icon">
          ${icons[type]}
        </div>
        <div class="custom-alert-message">
          ${message}
        </div>
        <button class="custom-alert-close" onclick="this.parentElement.parentElement.remove()">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `;

    // Verificar si ya existen los estilos CSS para las alertas
    // getElementById retorna null si no existe, lo que evita duplicar estilos
    if (!document.getElementById('custom-alert-styles')) {
      // Crear elemento <style> para inyectar CSS dinámicamente
      const styles = document.createElement('style');
      styles.id = 'custom-alert-styles'; // ID único para evitar duplicados
      
      // Definir todos los estilos CSS como string
      styles.textContent = `
        /* Contenedor principal de la alerta */
        .custom-alert {
          position: fixed; /* Posición fija sobre el contenido */
          top: 20px; /* Separación desde arriba */
          right: 20px; /* Separación desde la derecha */
          min-width: 320px; /* Ancho mínimo */
          max-width: 500px; /* Ancho máximo */
          padding: 16px; /* Espaciado interno */
          border-radius: 12px; /* Bordes redondeados */
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15); /* Sombra suave */
          z-index: 10000; /* Aparecer sobre todo el contenido */
          animation: slideInRight 0.3s ease-out; /* Animación de entrada */
          backdrop-filter: blur(10px); /* Efecto de desenfoque de fondo */
        }

        /* Animación de entrada deslizando desde la derecha */
        @keyframes slideInRight {
          from {
            transform: translateX(400px); /* Inicia fuera de pantalla */
            opacity: 0; /* Inicia invisible */
          }
          to {
            transform: translateX(0); /* Termina en su posición */
            opacity: 1; /* Termina visible */
          }
        }

        /* Animación de salida deslizando hacia la derecha */
        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(400px);
            opacity: 0;
          }
        }

        /* Estilo para alerta de éxito - fondo verde */
        .custom-alert-success {
          background: linear-gradient(135deg, rgba(0, 191, 166, 0.95) 0%, rgba(0, 212, 184, 0.95) 100%);
          color: white;
        }

        /* Estilo para alerta de error - fondo rojo */
        .custom-alert-error {
          background: linear-gradient(135deg, rgba(239, 83, 80, 0.95) 0%, rgba(229, 57, 53, 0.95) 100%);
          color: white;
        }

        /* Estilo para alerta de advertencia - fondo naranja */
        .custom-alert-warning {
          background: linear-gradient(135deg, rgba(255, 167, 38, 0.95) 0%, rgba(251, 140, 0, 0.95) 100%);
          color: white;
        }

        /* Estilo para alerta informativa - fondo azul */
        .custom-alert-info {
          background: linear-gradient(135deg, rgba(3, 169, 244, 0.95) 0%, rgba(2, 136, 209, 0.95) 100%);
          color: white;
        }

        /* Contenedor flex para alinear icono, mensaje y botón */
        .custom-alert-content {
          display: flex;
          align-items: center; /* Alineación vertical centrada */
          gap: 12px; /* Espaciado entre elementos */
        }

        /* Estilo del icono */
        .custom-alert-icon {
          font-size: 24px;
          flex-shrink: 0; /* No se reduce si falta espacio */
        }

        /* Estilo del mensaje */
        .custom-alert-message {
          flex: 1; /* Toma todo el espacio disponible */
          font-size: 15px;
          line-height: 1.4;
          font-weight: 500;
        }

        /* Botón de cerrar */
        .custom-alert-close {
          background: none; /* Sin fondo */
          border: none; /* Sin borde */
          color: white;
          font-size: 20px;
          cursor: pointer; /* Cursor de mano al pasar */
          padding: 4px;
          opacity: 0.8; /* Semi-transparente */
          transition: opacity 0.2s; /* Transición suave */
          flex-shrink: 0; /* No se reduce */
        }

        /* Efecto hover en botón cerrar */
        .custom-alert-close:hover {
          opacity: 1; /* Totalmente opaco al pasar el mouse */
        }

        /* Diseño responsive para móviles */
        @media (max-width: 576px) {
          .custom-alert {
            left: 10px; /* Centrar horizontalmente */
            right: 10px;
            min-width: auto; /* Ancho automático */
          }
        }
      `;
      // Añadir los estilos al <head> del documento
      document.head.appendChild(styles);
    }

    // Añadir la alerta al final del <body>
    document.body.appendChild(alertDiv);

    // Programar el auto-cierre después del tiempo especificado
    setTimeout(() => {
      // Aplicar animación de salida
      alertDiv.style.animation = 'slideOutRight 0.3s ease-out';
      // Esperar a que termine la animación antes de remover
      setTimeout(() => {
        // Verificar que aún existe antes de eliminar
        if (alertDiv.parentElement) {
          alertDiv.remove(); // Eliminar del DOM
        }
      }, 300); // 300ms = duración de la animación
    }, duration);
  }

  /**
   * Método atajo para mostrar alerta de éxito
   * @param message - Mensaje de éxito
   * @param duration - Duración opcional
   */
  success(message: string, duration?: number) {
    this.show(message, 'success', duration);
  }

  /**
   * Método atajo para mostrar alerta de error
   * @param message - Mensaje de error
   * @param duration - Duración opcional
   */
  error(message: string, duration?: number) {
    this.show(message, 'error', duration);
  }

  /**
   * Método atajo para mostrar alerta de advertencia
   * @param message - Mensaje de advertencia
   * @param duration - Duración opcional
   */
  warning(message: string, duration?: number) {
    this.show(message, 'warning', duration);
  }

  /**
   * Método atajo para mostrar alerta informativa
   * @param message - Mensaje informativo
   * @param duration - Duración opcional
   */
  info(message: string, duration?: number) {
    this.show(message, 'info', duration);
  }

  /**
   * Muestra un modal de confirmación personalizado
   * Retorna una Promise que se resuelve con true/false según la decisión del usuario
   * @param message - Mensaje de confirmación
   * @param title - Título del modal (default: '¿Estás seguro?')
   * @returns Promise<boolean> - true si acepta, false si cancela
   */
  async confirm(message: string, title: string = '¿Estás seguro?'): Promise<boolean> {
    // Retornar una Promise para manejar la respuesta asíncrona del usuario
    return new Promise((resolve) => {
      // Crear overlay (fondo oscuro) que cubre toda la pantalla
      const modalDiv = document.createElement('div');
      modalDiv.className = 'custom-confirm-overlay';
      
      // Construir estructura HTML del modal
      modalDiv.innerHTML = `
        <div class="custom-confirm-modal">
          <div class="custom-confirm-header">
            <i class="fa-solid fa-circle-question"></i>
            <h3>${title}</h3>
          </div>
          <div class="custom-confirm-body">
            <p>${message}</p>
          </div>
          <div class="custom-confirm-footer">
            <button class="custom-confirm-btn custom-confirm-cancel">Cancelar</button>
            <button class="custom-confirm-btn custom-confirm-accept">Aceptar</button>
          </div>
        </div>
      `;

      // Verificar si ya existen los estilos del modal
      if (!document.getElementById('custom-confirm-styles')) {
        const styles = document.createElement('style');
        styles.id = 'custom-confirm-styles';
        styles.textContent = `
          /* Overlay de fondo oscuro */
          .custom-confirm-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6); /* Fondo negro semi-transparente */
            display: flex;
            justify-content: center; /* Centrar horizontalmente */
            align-items: center; /* Centrar verticalmente */
            z-index: 10001; /* Sobre las alertas normales */
            animation: fadeIn 0.2s ease-out;
          }

          /* Animación de aparición del fondo */
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          /* Contenedor del modal */
          .custom-confirm-modal {
            background: white;
            border-radius: 16px;
            max-width: 400px;
            width: 90%; /* Responsive */
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            animation: scaleIn 0.3s ease-out;
          }

          /* Animación de escala al aparecer */
          @keyframes scaleIn {
            from {
              transform: scale(0.9); /* Inicia pequeño */
              opacity: 0;
            }
            to {
              transform: scale(1); /* Termina en tamaño normal */
              opacity: 1;
            }
          }

          /* Encabezado del modal con icono y título */
          .custom-confirm-header {
            background: linear-gradient(135deg, #00bfa6 0%, #00d4b8 100%);
            color: white;
            padding: 20px;
            text-align: center;
          }

          .custom-confirm-header i {
            font-size: 48px;
            margin-bottom: 10px;
          }

          .custom-confirm-header h3 {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
          }

          /* Cuerpo del modal con el mensaje */
          .custom-confirm-body {
            padding: 24px;
          }

          .custom-confirm-body p {
            margin: 0;
            font-size: 15px;
            line-height: 1.6;
            color: #333;
            text-align: center;
          }

          /* Footer con botones */
          .custom-confirm-footer {
            padding: 16px 24px 24px;
            display: flex;
            gap: 12px; /* Espacio entre botones */
            justify-content: center;
          }

          /* Estilo base de los botones */
          .custom-confirm-btn {
            padding: 12px 32px;
            border: none;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s; /* Transición suave */
          }

          /* Botón de cancelar - gris */
          .custom-confirm-cancel {
            background: #e0e0e0;
            color: #333;
          }

          .custom-confirm-cancel:hover {
            background: #d0d0d0; /* Más oscuro al pasar */
          }

          /* Botón de aceptar - verde */
          .custom-confirm-accept {
            background: linear-gradient(135deg, #00bfa6 0%, #00d4b8 100%);
            color: white;
          }

          .custom-confirm-accept:hover {
            background: linear-gradient(135deg, #00a693 0%, #00bfa6 100%);
          }
        `;
        document.head.appendChild(styles);
      }

      // Añadir el modal al body
      document.body.appendChild(modalDiv);

      // Obtener referencias a los botones
      const cancelBtn = modalDiv.querySelector('.custom-confirm-cancel') as HTMLElement;
      const acceptBtn = modalDiv.querySelector('.custom-confirm-accept') as HTMLElement;

      // Evento click en botón cancelar
      cancelBtn.onclick = () => {
        modalDiv.remove(); // Eliminar modal del DOM
        resolve(false); // Resolver Promise con false
      };

      // Evento click en botón aceptar
      acceptBtn.onclick = () => {
        modalDiv.remove();
        resolve(true); // Resolver Promise con true
      };

      // Cerrar modal al hacer clic fuera de él (en el overlay)
      modalDiv.onclick = (e) => {
        // e.target es el elemento clickeado
        if (e.target === modalDiv) { // Si es el overlay (no el modal)
          modalDiv.remove();
          resolve(false); // Cancelar por defecto
        }
      };
    });
  }
}

