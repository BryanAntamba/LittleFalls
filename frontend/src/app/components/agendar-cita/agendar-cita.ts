import { Component } from '@angular/core';
import { BarraNavegacion } from "../barra-navegacion/barra-navegacion";
import { PiePagina } from "../pie-pagina/pie-pagina";
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-agendar-cita',
  imports: [RouterModule, BarraNavegacion, PiePagina, CommonModule, FormsModule],
  templateUrl: './agendar-cita.html',
  styleUrl: './agendar-cita.css',
})
export class AgendarCita {
  horaSeleccionada = '';
  fechaSeleccionada = '';

  constructor(
    private router: Router,
    private alertService: AlertService
  ) {}

  siguientePaso() {
    if (!this.horaSeleccionada || !this.fechaSeleccionada) {
      this.alertService.error('Por favor seleccione fecha y hora');
      return;
    }

    localStorage.setItem('horaCita', this.horaSeleccionada);
    localStorage.setItem('fechaCita', this.fechaSeleccionada);
    
    this.router.navigate(['/FormularioCita']);
  }
}
