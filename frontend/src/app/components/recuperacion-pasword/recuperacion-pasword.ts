import { Component } from '@angular/core';
import { PiePagina } from '../pie-pagina/pie-pagina';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-recuperacion-pasword',
  standalone: true,
  imports: [RouterModule, PiePagina, CommonModule, FormsModule],
  templateUrl: './recuperacion-pasword.html',
  styleUrl: './recuperacion-pasword.css',
})
export class RecuperacionPasword {
  correo: string = '';
  cargando: boolean = false;
  errorCorreo: string = '';
  errorGeneral: string = '';
  successMessage: string = '';

  constructor(private router: Router) {}

  // Permitir escribir cualquier formato en correo (validación solo al registrar)
  filterCorreo(event: any) {
    // No hacer nada, permitir cualquier carácter
    // La validación se hará solo al hacer click en Enviar Código
  }

  async solicitarRecuperacion() {
    // Limpiar errores previos
    this.errorCorreo = '';
    this.errorGeneral = '';
    this.successMessage = '';

    // Validar que el correo no esté vacío
    if (!this.correo || this.correo.trim() === '') {
      this.errorCorreo = 'Por favor ingresa tu correo electrónico';
      return;
    }

    // Validar formato de correo (solo @gmail.com)
    const correoTrimmed = this.correo.trim().toLowerCase();
    if (!correoTrimmed.endsWith('@gmail.com')) {
      this.errorCorreo = 'El correo debe tener el formato usuario@gmail.com';
      return;
    } else if (!/^[A-Za-z0-9._\-]+@gmail\.com$/.test(correoTrimmed)) {
      this.errorCorreo = 'Por favor ingresa un correo válido (ej: usuario@gmail.com)';
      return;
    }

    this.cargando = true;

    try {
      const response = await fetch('http://localhost:3000/api/auth/recuperar-password/solicitar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: this.correo.trim() })
      });

      const resultado = await response.json();

      if (resultado.success) {
        this.successMessage = 'Se ha enviado un código de recuperación a tu correo electrónico. Por favor revisa tu bandeja de entrada.';
        // Navegar a la pantalla de verificar código, pasando el correo
        this.router.navigate(['/VerificarCodigoRecuperacion'], { 
          queryParams: { correo: this.correo.trim(), tipo: 'recuperacion' } 
        });
      } else {
        this.errorGeneral = resultado.mensaje || 'Error al procesar la solicitud';
      }
    } catch (error) {
      console.error('Error:', error);
      this.errorGeneral = 'Error de conexión con el servidor. Por favor intenta de nuevo.';
    } finally {
      this.cargando = false;
    }
  }

  clearError() {
    this.errorCorreo = '';
    this.errorGeneral = '';
    this.successMessage = '';
  }
}
