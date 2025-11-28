import { Component } from '@angular/core';
import { RouterModule, Router } from "@angular/router";
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-barra-navegacion',
  imports: [RouterModule, CommonModule],
  templateUrl: './barra-navegacion.html',
  styleUrl: './barra-navegacion.css',
})
export class BarraNavegacion {
  constructor(public authService: AuthService, private router: Router) {}

  get usuario() {
    return this.authService.getUsuario();
  }

  get esPaciente() {
    return this.authService.hasRole('paciente');
  }

  get estaLogueado() {
    return this.authService.isLoggedIn();
  }

  cerrarSesion() {
    this.authService.logout();
  }

  irACitas() {
    if (this.estaLogueado) {
      this.router.navigate(['/AgendamientoCita']);
    } else {
      this.router.navigate(['/Login-LittleFalls']);
    }
  }
}
