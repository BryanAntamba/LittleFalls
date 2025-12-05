import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { PiePagina } from '../pie-pagina/pie-pagina';

@Component({
  selector: 'app-verificar-codigo',
  imports: [RouterModule, CommonModule, FormsModule, PiePagina],
  templateUrl: './verificar-codigo.html',
  styleUrl: './verificar-codigo.css',
})
export class VerificarCodigo implements OnInit {
  correo: string = '';
  codigo: string = '';
  cargando: boolean = false;
  reenviando: boolean = false;
  tipoVerificacion: string = 'registro'; // 'registro' o 'recuperacion'

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    // Obtener el correo y tipo de los parámetros de la ruta
    this.route.queryParams.subscribe(params => {
      this.correo = params['correo'] || '';
      this.tipoVerificacion = params['tipo'] || 'registro';
    });
  }

  async verificarCodigo() {
    if (!this.codigo || this.codigo.trim().length !== 6) {
      this.alertService.error('Por favor ingresa el código de 6 dígitos');
      return;
    }

    // Validar que solo contenga números
    if (!/^\d{6}$/.test(this.codigo.trim())) {
      this.alertService.error('El código debe contener solo 6 números');
      return;
    }

    this.cargando = true;

    try {
      // Usar endpoint diferente según el tipo de verificación
      const endpoint = this.tipoVerificacion === 'recuperacion' 
        ? 'http://localhost:3000/api/auth/recuperar-password/verificar-codigo'
        : 'http://localhost:3000/api/auth/verificar-codigo';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo: this.correo,
          codigo: this.codigo.trim()
        })
      });

      const resultado = await response.json();
      this.cargando = false;

      if (resultado.success) {
        if (this.tipoVerificacion === 'recuperacion') {
          // Para recuperación, ir a restablecer contraseña
          this.alertService.success('Código verificado. Ahora puedes establecer tu nueva contraseña.');
          this.router.navigate(['/RestablecerPasword'], { 
            queryParams: { 
              correo: this.correo,
              codigo: this.codigo.trim()
            } 
          });
        } else {
          // Para registro, ir a login
          this.alertService.success('¡Cuenta verificada exitosamente! Ya puedes iniciar sesión');
          this.router.navigate(['/Login-LittleFalls']);
        }
      } else {
        if (resultado.codigoExpirado) {
          const reenviar = confirm(
            resultado.mensaje + '\n\n¿Deseas recibir un nuevo código?'
          );
          if (reenviar) {
            this.reenviarCodigo();
          }
        } else {
          this.alertService.error(resultado.mensaje || 'Error al verificar el código');
        }
      }
    } catch (error) {
      this.cargando = false;
      this.alertService.error('Error de conexión con el servidor. Por favor intenta de nuevo.');
    }
  }

  async reenviarCodigo() {
    if (!this.correo) {
      this.alertService.error('Correo no disponible');
      return;
    }

    this.reenviando = true;

    try {
      // Usar endpoint diferente según el tipo
      const endpoint = this.tipoVerificacion === 'recuperacion'
        ? 'http://localhost:3000/api/auth/recuperar-password/solicitar'
        : 'http://localhost:3000/api/auth/reenviar-codigo';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: this.correo })
      });

      const resultado = await response.json();
      this.reenviando = false;

      if (resultado.success) {
        this.alertService.success(resultado.mensaje);
        this.codigo = ''; // Limpiar el campo
      } else {
        this.alertService.error(resultado.mensaje || 'Error al reenviar el código');
      }
    } catch (error) {
      this.reenviando = false;
      this.alertService.error('Error de conexión con el servidor. Por favor intenta de nuevo.');
    }
  }

  // Permitir solo números en el input
  onlyNumbers(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
    }
  }
}
