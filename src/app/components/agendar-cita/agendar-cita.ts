import { Component } from '@angular/core';
import { BarraNavegacion } from "../barra-navegacion/barra-navegacion";
import { PiePagina } from "../pie-pagina/pie-pagina";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-agendar-cita',
  imports: [RouterModule ,BarraNavegacion, PiePagina],
  templateUrl: './agendar-cita.html',
  styleUrl: './agendar-cita.css',
})
export class AgendarCita {

}
