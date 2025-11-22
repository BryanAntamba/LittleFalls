import { Component } from '@angular/core';
import { BarraNavegacion } from "../barra-navegacion/barra-navegacion";
import { PiePagina } from "../pie-pagina/pie-pagina";
import { RouterModule } from "@angular/router";

@Component({
  selector: 'app-inicio',
  imports: [RouterModule, BarraNavegacion, PiePagina],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio {

}
