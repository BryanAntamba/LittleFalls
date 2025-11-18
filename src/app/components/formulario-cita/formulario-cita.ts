import { Component } from '@angular/core';
import { BarraNavegacion } from '../barra-navegacion/barra-navegacion';
import { PiePagina } from '../pie-pagina/pie-pagina';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-formulario-cita',
  standalone: true,
  imports: [BarraNavegacion, PiePagina, RouterModule],
  templateUrl: './formulario-cita.html',
  styleUrl: './formulario-cita.css',
})
export class FormularioCita {

}
