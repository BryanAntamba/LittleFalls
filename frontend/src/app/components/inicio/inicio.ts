import { Component } from '@angular/core';
import { BarraNavegacion } from "../barra-navegacion/barra-navegacion";
import { PiePagina } from "../pie-pagina/pie-pagina";
import { RouterModule, Router } from "@angular/router";
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-inicio',
  imports: [RouterModule, BarraNavegacion, PiePagina],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio {
  constructor(private authService: AuthService, private router: Router) {}

  agendarCita() {
    console.log('Botón clickeado');
    console.log('Usuario logueado:', this.authService.isLoggedIn());
    
    // Si es paciente logueado, ir a agendar cita
    // Si no está logueado o es otro rol, ir al login
    if (this.authService.hasRole('paciente')) {
      this.router.navigate(['/AgendamientoCita']);
    } else {
      this.router.navigate(['/Login-LittleFalls']);
    }
  }
}
