import { Component } from '@angular/core';
import { PiePagina } from '../pie-pagina/pie-pagina';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [RouterModule, PiePagina, CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  showPassword: boolean = false;
  correo: string = '';
  password: string = '';
  cargando: boolean = false;

  constructor(private router: Router, private authService: AuthService) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async iniciarSesion() {
    // Validaciones
    if (!this.correo || !this.password) {
      alert('Por favor completa todos los campos');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.correo)) {
      alert('Por favor ingresa un correo válido');
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
        if (resultado.errores && resultado.errores.length > 0) {
          alert('Errores:\n- ' + resultado.errores.join('\n- '));
        } else {
          alert(resultado.mensaje || 'Credenciales incorrectas');
        }
      }
    } catch (error) {
      this.cargando = false;
      alert('Error de conexión con el servidor. Por favor intenta de nuevo.');
    }
  }
}
