import { Component } from '@angular/core';
import { PiePagina } from '../pie-pagina/pie-pagina';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [RouterModule,PiePagina],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

}
