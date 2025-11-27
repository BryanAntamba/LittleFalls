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

  constructor(private router: Router, private authService: AuthService) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async registrarse() {
    // Validaciones básicas
    if (!this.nombre || !this.apellido || !this.edad || !this.correo || !this.password) {
      alert('Por favor completa todos los campos');
      return;
    }

    // Validar nombre y apellido
    if (this.nombre.trim().length < 2) {
      alert('El nombre debe tener al menos 2 caracteres');
      return;
    }
    if (this.apellido.trim().length < 2) {
      alert('El apellido debe tener al menos 2 caracteres');
      return;
    }

    // Validar edad
    if (this.edad < 18) {
      alert('Debes ser mayor de 18 años para registrarte');
      return;
    }
    if (this.edad > 120) {
      alert('Por favor ingresa una edad válida');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.correo)) {
      alert('Por favor ingresa un correo válido');
      return;
    }

    // Validar contraseña
    if (this.password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (!/[a-zA-Z]/.test(this.password)) {
      alert('La contraseña debe contener al menos una letra');
      return;
    }
    if (!/[0-9]/.test(this.password)) {
      alert('La contraseña debe contener al menos un número');
      return;
    }

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
          alert('✅ ' + resultado.mensaje);
          // Redirigir a la página de verificación con el correo como parámetro
          this.router.navigate(['/Verificar-Codigo'], {
            queryParams: { correo: this.correo.trim() }
          });
        } else {
          alert('¡Registro exitoso! Ahora puedes iniciar sesión');
          this.router.navigate(['/Login-LittleFalls']);
        }
      } else {
        // Mostrar errores del backend si existen
        if (resultado.errores && resultado.errores.length > 0) {
          alert('Errores:\n- ' + resultado.errores.join('\n- '));
        } else {
          alert(resultado.mensaje || 'Error al registrar');
        }
      }
    } catch (error) {
      this.cargando = false;
      alert('Error de conexión con el servidor. Por favor intenta de nuevo.');
    }
  }
}
