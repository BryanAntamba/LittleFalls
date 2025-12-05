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
  fechaMinima = '';

  constructor(
    private router: Router,
    private alertService: AlertService
  ) {
    // Establecer fecha mínima como hoy
    const hoy = new Date();
    this.fechaMinima = hoy.toISOString().split('T')[0];
  }

  siguientePaso() {
    if (!this.horaSeleccionada || !this.fechaSeleccionada) {
      this.alertService.error('Por favor seleccione fecha y hora');
      return;
    }

    localStorage.setItem('horaCita', this.horaSeleccionada);
    localStorage.setItem('fechaCita', this.fechaSeleccionada);
    
    this.router.navigate(['/FormularioCita']);
  }

  /**
   * Valida que la fecha seleccionada no sea una fecha pasada
   */
  validarFecha(event: any) {
    const fechaSeleccionada = new Date(event.target.value + 'T00:00:00');
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    // Verificar si es una fecha pasada
    if (fechaSeleccionada < hoy) {
      this.alertService.error('No se pueden agendar citas en fechas pasadas. Por favor seleccione una fecha futura.');
      event.target.value = '';
      this.fechaSeleccionada = '';
    }
  }
}
