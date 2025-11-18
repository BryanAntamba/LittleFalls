import { Component } from '@angular/core';
import { BarraNavegacionVeterinario } from '../barra-navegacion-veterinario/barra-navegacion-veterinario';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gestion-citas-veterinario',
  imports: [CommonModule, BarraNavegacionVeterinario],
  templateUrl: './gestion-citas-veterinario.html',
  styleUrl: './gestion-citas-veterinario.css',
})
export class GestionCitasVeterinario {

}
