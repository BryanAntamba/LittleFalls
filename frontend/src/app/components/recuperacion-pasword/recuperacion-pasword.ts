import { Component } from '@angular/core';
import { PiePagina } from '../pie-pagina/pie-pagina';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-recuperacion-pasword',
  imports: [RouterModule, PiePagina, CommonModule, FormsModule],
  templateUrl: './recuperacion-pasword.html',
  styleUrl: './recuperacion-pasword.css',
})
export class RecuperacionPasword {
  correo: string = '';
  cargando: boolean = false;

  constructor(private router: Router) {}

  async solicitarRecuperacion() {
    // Validar que el correo no esté vacío
    if (!this.correo || this.correo.trim() === '') {
      alert('Por favor ingresa tu correo electrónico');
      return;
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.correo.trim())) {
      alert('Por favor ingresa un correo electrónico válido');
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
        alert('Se ha enviado un código de recuperación a tu correo electrónico. Por favor revisa tu bandeja de entrada.');
        // Navegar a la pantalla de verificar código, pasando el correo
        this.router.navigate(['/VerificarCodigoRecuperacion'], { 
          queryParams: { correo: this.correo.trim(), tipo: 'recuperacion' } 
        });
      } else {
        alert(resultado.mensaje || 'Error al procesar la solicitud');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión con el servidor. Por favor intenta de nuevo.');
    } finally {
      this.cargando = false;
    }
  }
}
