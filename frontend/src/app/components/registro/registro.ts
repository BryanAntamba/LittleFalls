import { Component } from '@angular/core';
import { PiePagina } from '../pie-pagina/pie-pagina';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro',
  imports: [RouterModule, PiePagina, CommonModule, FormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  showPassword: boolean = false;
  nombre: string = '';
  apellido: string = '';
  edad: number = 0;
  correo: string = '';
  password: string = '';
  cargando: boolean = false;
  // Mensajes en lugar de alert
  errorNombre: string = '';
  errorApellido: string = '';
  errorEdad: string = '';
  errorCorreo: string = '';
  errorPassword: string = '';
  errorGeneral: string = '';
  successMessage: string = '';

  constructor(private router: Router, private authService: AuthService) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  // Filtrar caracteres en nombre y apellido (solo letras, espacios, guiones y apóstrofes)
  filterNombre(event: any) {
    const input = event.target;
    const value = input.value;
    // Rechaza números, símbolos aritméticos y caracteres especiales
    const filtrado = value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s']/g, '');
    input.value = filtrado;
    this.nombre = filtrado;
  }

  filterApellido(event: any) {
    const input = event.target;
    const value = input.value;
    // Rechaza números, símbolos aritméticos y caracteres especiales
    const filtrado = value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s']/g, '');
    input.value = filtrado;
    this.apellido = filtrado;
  }

  // Permitir escribir cualquier formato en correo (validación solo al registrar)
  filterCorreo(event: any) {
    // No hacer nada, permitir cualquier carácter
    // La validación se hará solo al hacer click en Registrarse
  }

  async registrarse() {
    // Limpiar errores previos solo al hacer click en Registrarse
    this.clearAllErrors();

    let hasError = false;

    // Reglas de validación
    const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/; // letras, espacios, guion y apóstrofe
    const emailRegex = /^[A-Za-z0-9._-]+@[A-Za-z0-9-]+\.[A-Za-z]{2,}$/; // más restrictivo
    const passwordAllowedRegex = /^[A-Za-z0-9]+$/; // solo letras y números

    // Validar nombre
    if (!this.nombre || this.nombre.trim() === '') {
      this.errorNombre = 'Por favor completa el nombre';
      hasError = true;
    } else if (this.nombre.trim().length < 2) {
      this.errorNombre = 'El nombre debe tener al menos 2 caracteres';
      hasError = true;
    } else if (!nameRegex.test(this.nombre.trim())) {
      this.errorNombre = 'El nombre no debe contener números ni símbolos';
      hasError = true;
    }

    // Validar apellido
    if (!this.apellido || this.apellido.trim() === '') {
      this.errorApellido = 'Por favor completa el apellido';
      hasError = true;
    } else if (this.apellido.trim().length < 2) {
      this.errorApellido = 'El apellido debe tener al menos 2 caracteres';
      hasError = true;
    } else if (!nameRegex.test(this.apellido.trim())) {
      this.errorApellido = 'El apellido no debe contener números ni símbolos';
      hasError = true;
    }

    // Validar edad
    if (!this.edad) {
      this.errorEdad = 'Por favor completa la edad';
      hasError = true;
    } else if (this.edad < 18) {
      this.errorEdad = 'Debes ser mayor de 18 años para registrarte';
      hasError = true;
    } else if (this.edad > 120) {
      this.errorEdad = 'Por favor ingresa una edad válida';
      hasError = true;
    }

    // Validar correo
    if (!this.correo || this.correo.trim() === '') {
      this.errorCorreo = 'Por favor completa el correo';
      hasError = true;
    } else {
      const correoTrimmed = this.correo.trim().toLowerCase();
      if (!correoTrimmed.endsWith('@gmail.com')) {
        this.errorCorreo = 'El correo debe tener el formato usuario@gmail.com';
        hasError = true;
      } else if (!/^[A-Za-z0-9._\-]+@gmail\.com$/.test(correoTrimmed)) {
        this.errorCorreo = 'Por favor ingresa un correo válido (ej: usuario@gmail.com)';
        hasError = true;
      }
    }

    // Validar contraseña
    if (!this.password || this.password.trim() === '') {
      this.errorPassword = 'Por favor completa la contraseña';
      hasError = true;
    } else if (this.password.length < 6) {
      this.errorPassword = 'La contraseña debe tener al menos 6 caracteres';
      hasError = true;
    } else if (!/[A-Za-z]/.test(this.password) || !/[0-9]/.test(this.password)) {
      this.errorPassword = 'La contraseña debe contener al menos una letra y un número';
      hasError = true;
    } else if (!passwordAllowedRegex.test(this.password)) {
      this.errorPassword = 'La contraseña no debe contener símbolos ni caracteres especiales';
      hasError = true;
    }

    if (hasError) return;

    this.cargando = true;

    try {
      // Llamar al servicio
      const resultado = await this.authService.registro(
        this.nombre.trim(),
        this.apellido.trim(),
        this.edad,
        this.correo.trim(),
        this.password
      );

      this.cargando = false;

      if (resultado.success) {
        if (resultado.requiereVerificacion) {
          this.successMessage = '✅ ' + resultado.mensaje;
          // Redirigir a la página de verificación con el correo como parámetro
          this.router.navigate(['/Verificar-Codigo'], {
            queryParams: { correo: this.correo.trim() }
          });
        } else {
          this.successMessage = '¡Registro exitoso! Ahora puedes iniciar sesión';
          this.router.navigate(['/Login-LittleFalls']);
        }
      } else {
        // Mostrar errores del backend si existen
        if (resultado.errores && resultado.errores.length > 0) {
          this.errorGeneral = resultado.errores.join(' \n ');
        } else {
          this.errorGeneral = resultado.mensaje || 'Error al registrar';
        }
      }
    } catch (error) {
      this.cargando = false;
      this.errorGeneral = 'Error de conexión con el servidor. Por favor intenta de nuevo.';
    }
  }

  clearError(field: string) {
    if (field === 'nombre') this.errorNombre = '';
    if (field === 'apellido') this.errorApellido = '';
    if (field === 'edad') this.errorEdad = '';
    if (field === 'correo') this.errorCorreo = '';
    if (field === 'password') this.errorPassword = '';
    this.errorGeneral = '';
    this.successMessage = '';
  }

  clearAllErrors() {
    this.errorNombre = '';
    this.errorApellido = '';
    this.errorEdad = '';
    this.errorCorreo = '';
    this.errorPassword = '';
    this.errorGeneral = '';
    this.successMessage = '';
  }
}
