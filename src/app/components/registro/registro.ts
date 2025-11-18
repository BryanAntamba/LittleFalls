import { Component } from '@angular/core';
import { PiePagina } from '../pie-pagina/pie-pagina'; 
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-registro',
  imports: [RouterModule,PiePagina],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {

}
