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
  verificando = false;

  constructor(
    private router: Router,
    private alertService: AlertService
  ) {
    // Establecer fecha mínima como hoy
    const hoy = new Date();
    this.fechaMinima = hoy.toISOString().split('T')[0];
  }

  async siguientePaso() {
    if (!this.horaSeleccionada || !this.fechaSeleccionada) {
      this.alertService.error('Por favor seleccione fecha y hora');
      return;
    }

    // Verificar disponibilidad antes de continuar
    this.verificando = true;
    
    try {
      const disponible = await this.verificarDisponibilidad(this.fechaSeleccionada, this.horaSeleccionada);
      
      if (!disponible) {
        this.alertService.error('Ese día y hora ya no están disponibles para agendar una cita. Por favor, intente con otra hora o día.');
        this.verificando = false;
        return;
      }

      // Si está disponible, guardar y continuar
      localStorage.setItem('horaCita', this.horaSeleccionada);
      localStorage.setItem('fechaCita', this.fechaSeleccionada);
      
      this.router.navigate(['/FormularioCita']);
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      this.alertService.error('Error al verificar disponibilidad. Por favor intente nuevamente.');
    } finally {
      this.verificando = false;
    }
  }

  async verificarDisponibilidad(fecha: string, hora: string): Promise<boolean> {
    try {
      // Convertir fecha para enviar al backend
      const fechaISO = new Date(fecha + 'T00:00:00').toISOString();
      
      const response = await fetch(`http://localhost:3000/api/citas/verificar-disponibilidad`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fecha: fechaISO, hora })
      });

      const resultado = await response.json();
      return resultado.disponible;
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      return false;
    }
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
