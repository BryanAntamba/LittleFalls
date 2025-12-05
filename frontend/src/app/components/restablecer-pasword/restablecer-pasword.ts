import { Component, OnInit } from '@angular/core';
import { PiePagina } from '../pie-pagina/pie-pagina';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-restablecer-pasword',
  standalone: true,
  imports: [RouterModule, PiePagina, CommonModule, FormsModule],
  templateUrl: './restablecer-pasword.html',
  styleUrl: './restablecer-pasword.css'
})
export class RestablecerPasword implements OnInit {
  correo: string = '';
  codigo: string = '';
  nuevaPassword: string = '';
  confirmarPassword: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  cargando: boolean = false;
  errorGeneral: string = '';
  errorNueva: string = '';
  errorConfirm: string = '';
  successMessage: string = '';
  mostrarErrores: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Obtener correo y código de los parámetros
    this.route.queryParams.subscribe(params => {
      this.correo = params['correo'] || '';
      this.codigo = params['codigo'] || '';
      
      // Si no hay correo o código, redirigir a recuperación
      if (!this.correo || !this.codigo) {
        this.errorGeneral = 'Sesión inválida. Por favor solicita un nuevo código.';
        this.router.navigate(['/RecuperacionPasword']);
      }
    });
  }

  togglePassword(event?: any) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(event?: any) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async restablecerPassword() {
    // Limpiar errores previos
    this.errorNueva = '';
    this.errorConfirm = '';
    this.errorGeneral = '';
    this.successMessage = '';

    // Filtrar caracteres inválidos
    this.nuevaPassword = this.nuevaPassword.replace(/[^A-Za-z0-9]/g, '');
    this.confirmarPassword = this.confirmarPassword.replace(/[^A-Za-z0-9]/g, '');

    // Validaciones
    if (!this.nuevaPassword || this.nuevaPassword.trim() === '') {
      this.errorNueva = 'Por favor ingresa tu nueva contraseña';
      this.mostrarErrores = true;
      this.cdr.markForCheck();
      return;
    }

    if (this.nuevaPassword.length < 6) {
      this.errorNueva = 'La contraseña debe tener al menos 6 caracteres';
      this.mostrarErrores = true;
      this.cdr.markForCheck();
      return;
    }

    // Validar que contenga letras y números
    const tieneLetra = /[a-zA-Z]/.test(this.nuevaPassword);
    const tieneNumero = /[0-9]/.test(this.nuevaPassword);
    if (!tieneLetra || !tieneNumero) {
      this.errorNueva = 'La contraseña debe contener al menos una letra y un número';
      this.mostrarErrores = true;
      this.cdr.markForCheck();
      return;
    }

    if (!this.confirmarPassword || this.confirmarPassword.trim() === '') {
      this.errorConfirm = 'Por favor confirma tu contraseña';
      this.mostrarErrores = true;
      this.cdr.markForCheck();
      return;
    }

    if (this.nuevaPassword !== this.confirmarPassword) {
      this.errorConfirm = 'Las contraseñas no coinciden';
      this.mostrarErrores = true;
      this.cdr.markForCheck();
      return;
    }

    this.cargando = true;

    try {
      const response = await fetch('http://localhost:3000/api/auth/recuperar-password/restablecer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo: this.correo,
          codigo: this.codigo,
          nuevaPassword: this.nuevaPassword
        })
      });

      const resultado = await response.json();

      if (resultado.success) {
        this.successMessage = '✅ ' + resultado.mensaje;
        this.cdr.markForCheck();
        this.router.navigate(['/Login-LittleFalls']);
      } else {
        this.mostrarErrores = true;
        if (resultado.codigoExpirado) {
          this.errorGeneral = resultado.mensaje + '\n\nSerás redirigido para solicitar un nuevo código.';
          this.cdr.markForCheck();
          this.router.navigate(['/RecuperacionPasword']);
        } else {
          this.errorGeneral = resultado.mensaje || 'Error al restablecer la contraseña';
          this.cdr.markForCheck();
        }
      }
    } catch (error) {
      console.error('Error:', error);
      this.mostrarErrores = true;
      this.errorGeneral = 'Error de conexión con el servidor. Por favor intenta de nuevo.';
      this.cdr.markForCheck();
    } finally {
      this.cargando = false;
    }
  }

  clearError() {
    this.errorNueva = '';
    this.errorConfirm = '';
    this.errorGeneral = '';
    this.successMessage = '';
  }
}
