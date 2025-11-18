import { Component } from '@angular/core';
import { BarraNavegacionVeterinario } from '../barra-navegacion-veterinario/barra-navegacion-veterinario';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-historial-mascota-veterinario',
  imports: [CommonModule, BarraNavegacionVeterinario],
  templateUrl: './historial-mascota-veterinario.html',
  styleUrl: './historial-mascota-veterinario.css',
})
export class HistorialMascotaVeterinario {

}
