import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  /**
   * Muestra una alerta personalizada
   */
  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration: number = 4000) {
    // Crear el contenedor de la alerta
    const alertDiv = document.createElement('div');
    alertDiv.className = `custom-alert custom-alert-${type}`;
    
    // Iconos según el tipo
    const icons = {
      success: '<i class="fa-solid fa-circle-check"></i>',
      error: '<i class="fa-solid fa-circle-xmark"></i>',
      warning: '<i class="fa-solid fa-triangle-exclamation"></i>',
      info: '<i class="fa-solid fa-circle-info"></i>'
    };

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

    // Añadir estilos si no existen
    if (!document.getElementById('custom-alert-styles')) {
      const styles = document.createElement('style');
      styles.id = 'custom-alert-styles';
      styles.textContent = `
        .custom-alert {
          position: fixed;
          top: 20px;
          right: 20px;
          min-width: 320px;
          max-width: 500px;
          padding: 16px;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          z-index: 10000;
          animation: slideInRight 0.3s ease-out;
          backdrop-filter: blur(10px);
        }

        @keyframes slideInRight {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

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

        .custom-alert-success {
          background: linear-gradient(135deg, rgba(0, 191, 166, 0.95) 0%, rgba(0, 212, 184, 0.95) 100%);
          color: white;
        }

        .custom-alert-error {
          background: linear-gradient(135deg, rgba(239, 83, 80, 0.95) 0%, rgba(229, 57, 53, 0.95) 100%);
          color: white;
        }

        .custom-alert-warning {
          background: linear-gradient(135deg, rgba(255, 167, 38, 0.95) 0%, rgba(251, 140, 0, 0.95) 100%);
          color: white;
        }

        .custom-alert-info {
          background: linear-gradient(135deg, rgba(3, 169, 244, 0.95) 0%, rgba(2, 136, 209, 0.95) 100%);
          color: white;
        }

        .custom-alert-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .custom-alert-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .custom-alert-message {
          flex: 1;
          font-size: 15px;
          line-height: 1.4;
          font-weight: 500;
        }

        .custom-alert-close {
          background: none;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
          padding: 4px;
          opacity: 0.8;
          transition: opacity 0.2s;
          flex-shrink: 0;
        }

        .custom-alert-close:hover {
          opacity: 1;
        }

        @media (max-width: 576px) {
          .custom-alert {
            left: 10px;
            right: 10px;
            min-width: auto;
          }
        }
      `;
      document.head.appendChild(styles);
    }

    // Añadir al body
    document.body.appendChild(alertDiv);

    // Auto-cerrar después del tiempo especificado
    setTimeout(() => {
      alertDiv.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => {
        if (alertDiv.parentElement) {
          alertDiv.remove();
        }
      }, 300);
    }, duration);
  }

  success(message: string, duration?: number) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number) {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration?: number) {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration?: number) {
    this.show(message, 'info', duration);
  }

  /**
   * Muestra una alerta de confirmación personalizada
   */
  async confirm(message: string, title: string = '¿Estás seguro?'): Promise<boolean> {
    return new Promise((resolve) => {
      const modalDiv = document.createElement('div');
      modalDiv.className = 'custom-confirm-overlay';
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

      // Añadir estilos si no existen
      if (!document.getElementById('custom-confirm-styles')) {
        const styles = document.createElement('style');
        styles.id = 'custom-confirm-styles';
        styles.textContent = `
          .custom-confirm-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10001;
            animation: fadeIn 0.2s ease-out;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          .custom-confirm-modal {
            background: white;
            border-radius: 16px;
            max-width: 400px;
            width: 90%;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            animation: scaleIn 0.3s ease-out;
          }

          @keyframes scaleIn {
            from {
              transform: scale(0.9);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }

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

          .custom-confirm-footer {
            padding: 16px 24px 24px;
            display: flex;
            gap: 12px;
            justify-content: center;
          }

          .custom-confirm-btn {
            padding: 12px 32px;
            border: none;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .custom-confirm-cancel {
            background: #e0e0e0;
            color: #333;
          }

          .custom-confirm-cancel:hover {
            background: #d0d0d0;
          }

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

      document.body.appendChild(modalDiv);

      const cancelBtn = modalDiv.querySelector('.custom-confirm-cancel') as HTMLElement;
      const acceptBtn = modalDiv.querySelector('.custom-confirm-accept') as HTMLElement;

      cancelBtn.onclick = () => {
        modalDiv.remove();
        resolve(false);
      };

      acceptBtn.onclick = () => {
        modalDiv.remove();
        resolve(true);
      };

      // Cerrar al hacer clic fuera
      modalDiv.onclick = (e) => {
        if (e.target === modalDiv) {
          modalDiv.remove();
          resolve(false);
        }
      };
    });
  }
}
