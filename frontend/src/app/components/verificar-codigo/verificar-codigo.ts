import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Obtener el correo de los parámetros de la ruta
    this.route.queryParams.subscribe(params => {
      this.correo = params['correo'] || '';
    });
  }

  async verificarCodigo() {
    if (!this.codigo || this.codigo.trim().length !== 6) {
      alert('Por favor ingresa el código de 6 dígitos');
      return;
    }

    // Validar que solo contenga números
    if (!/^\d{6}$/.test(this.codigo.trim())) {
      alert('El código debe contener solo 6 números');
      return;
    }

    this.cargando = true;

    try {
      const response = await fetch('http://localhost:3000/api/auth/verificar-codigo', {
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
        alert('¡Cuenta verificada exitosamente! Ya puedes iniciar sesión');
        this.router.navigate(['/Login-LittleFalls']);
      } else {
        if (resultado.codigoExpirado) {
          const reenviar = confirm(
            resultado.mensaje + '\n\n¿Deseas recibir un nuevo código?'
          );
          if (reenviar) {
            this.reenviarCodigo();
          }
        } else {
          alert(resultado.mensaje || 'Error al verificar el código');
        }
      }
    } catch (error) {
      this.cargando = false;
      alert('Error de conexión con el servidor. Por favor intenta de nuevo.');
    }
  }

  async reenviarCodigo() {
    if (!this.correo) {
      alert('Correo no disponible');
      return;
    }

    this.reenviando = true;

    try {
      const response = await fetch('http://localhost:3000/api/auth/reenviar-codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: this.correo })
      });

      const resultado = await response.json();
      this.reenviando = false;

      if (resultado.success) {
        alert('✅ ' + resultado.mensaje);
        this.codigo = ''; // Limpiar el campo
      } else {
        alert(resultado.mensaje || 'Error al reenviar el código');
      }
    } catch (error) {
      this.reenviando = false;
      alert('Error de conexión con el servidor. Por favor intenta de nuevo.');
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
