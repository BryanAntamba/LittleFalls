import { Component } from '@angular/core';
import { PiePagina } from '../pie-pagina/pie-pagina';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, PiePagina, CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  showPassword: boolean = false;
  correo: string = '';
  password: string = '';
  cargando: boolean = false;
  // Mensajes para mostrar en el HTML en lugar de alerts
  errorCorreo: string = '';
  errorPassword: string = '';
  errorGeneral: string = '';
  successMessage: string = '';
  mostrarErrores: boolean = false; // Control para mostrar errores solo después de intentar enviar

  constructor(private router: Router, private authService: AuthService, private cdr: ChangeDetectorRef) {}

  togglePassword(event?: any) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.showPassword = !this.showPassword;
  }

  // Filtrar password: solo permite letras y números
  filterPassword(event: any) {
    const input = event.target;
    const value = input.value;
    const filtrado = value.replace(/[^A-Za-z0-9]/g, '');
    input.value = filtrado;
    this.password = filtrado;
  }

  async iniciarSesion() {
    // Limpiar mensajes previos
    this.errorCorreo = '';
    this.errorPassword = '';
    this.errorGeneral = '';
    this.successMessage = '';

    // Validaciones
    if (!this.correo || !this.correo.trim()) {
      this.errorCorreo = 'Por favor completa el correo';
      this.mostrarErrores = true;
      this.cdr.markForCheck();
      return;
    }

    // Validar formato de email con dominios específicos
    const dominiosPermitidos = /^[^\s@]+@(gmail\.com|littlefalls\.com|veterinario\.com)$/;
    if (!dominiosPermitidos.test(this.correo.trim())) {
      this.errorCorreo = 'Ingrese su correo correctamente';
      this.mostrarErrores = true;
      this.cdr.markForCheck();
      return;
    }

    if (!this.password || !this.password.trim()) {
      this.errorPassword = 'Por favor completa la contraseña';
      this.mostrarErrores = true;
      this.cdr.markForCheck();
      return;
    }

    this.cargando = true;

    try {
      // Llamar al servicio (sin tipoUsuario)
      const resultado = await this.authService.login(this.correo.trim(), this.password);

      this.cargando = false;

      if (resultado.success) {
        // Redirigir automáticamente según el rol detectado del backend
        this.authService.redirectToDashboard(resultado.usuario.tipoUsuario);
      } else {
        // Mostrar errores del backend si existen
        this.mostrarErrores = true;
        if (resultado.errores && resultado.errores.length > 0) {
          this.errorGeneral = resultado.errores.join(' \n ');
        } else {
          this.errorGeneral = resultado.mensaje || 'Credenciales incorrectas';
        }
        this.cdr.markForCheck();
      }
    } catch (error) {
      this.cargando = false;
      this.mostrarErrores = true;
      this.errorGeneral = 'Error de conexión con el servidor. Por favor intenta de nuevo.';
      this.cdr.markForCheck();
    }
  }

  // Limpiar errores cuando el usuario escribe
  clearError(field: string) {
    this.mostrarErrores = false;
    if (field === 'correo') this.errorCorreo = '';
    if (field === 'password') this.errorPassword = '';
    if (field === 'general') this.errorGeneral = '';
    this.successMessage = '';
  }
}
