import { Component } from '@angular/core';
import { PiePagina } from '../pie-pagina/pie-pagina';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-restablecer-pasword',
  imports: [RouterModule, PiePagina],
  templateUrl: './restablecer-pasword.html',
  styleUrl: './restablecer-pasword.css',
})
export class RestablecerPasword {
  //Declaración de propiedad para controlar la visibilidad de la contraseña
  //Se inicializa en false para que la contraseña esté oculta por defecto
  showPassword: boolean = false;

  //Método que alterna el estado de visibilidad
  togglePassword() {
    //Cambia showPassword de true a false o viceversa
    //Se ejecuta cuando el usuario hace clic en el icono del ojo
    this.showPassword = !this.showPassword;
  }
}
