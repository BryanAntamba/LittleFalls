import { Component, OnInit } from '@angular/core';
import { PiePagina } from '../pie-pagina/pie-pagina';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-restablecer-pasword',
  imports: [RouterModule, PiePagina, CommonModule, FormsModule],
  templateUrl: './restablecer-pasword.html',
  styleUrl: './restablecer-pasword.css',
})
export class RestablecerPasword implements OnInit {
  correo: string = '';
  codigo: string = '';
  nuevaPassword: string = '';
  confirmarPassword: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  cargando: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Obtener correo y código de los parámetros
    this.route.queryParams.subscribe(params => {
      this.correo = params['correo'] || '';
      this.codigo = params['codigo'] || '';
      
      // Si no hay correo o código, redirigir a recuperación
      if (!this.correo || !this.codigo) {
        alert('Sesión inválida. Por favor solicita un nuevo código.');
        this.router.navigate(['/RecuperacionPasword']);
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async restablecerPassword() {
    // Validaciones
    if (!this.nuevaPassword || this.nuevaPassword.trim() === '') {
      alert('Por favor ingresa tu nueva contraseña');
      return;
    }

    if (this.nuevaPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Validar que contenga letras y números
    const tieneLetra = /[a-zA-Z]/.test(this.nuevaPassword);
    const tieneNumero = /[0-9]/.test(this.nuevaPassword);
    if (!tieneLetra || !tieneNumero) {
      alert('La contraseña debe contener al menos una letra y un número');
      return;
    }

    if (this.nuevaPassword !== this.confirmarPassword) {
      alert('Las contraseñas no coinciden');
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
        alert('✅ ' + resultado.mensaje);
        this.router.navigate(['/Login-LittleFalls']);
      } else {
        if (resultado.codigoExpirado) {
          alert(resultado.mensaje + '\n\nSerás redirigido para solicitar un nuevo código.');
          this.router.navigate(['/RecuperacionPasword']);
        } else {
          alert(resultado.mensaje || 'Error al restablecer la contraseña');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión con el servidor. Por favor intenta de nuevo.');
    } finally {
      this.cargando = false;
    }
  }
}
