// Importación del decorador Component desde el core de Angular
import { Component } from '@angular/core';
// Importación del módulo RouterModule para funcionalidad de enrutamiento
import { RouterModule } from '@angular/router';

// Decorador que convierte la clase en un componente Angular
@Component({
  // selector: nombre del tag HTML que representa este componente
  selector: 'app-barra-navegacion-veterinario',
  // standalone: true - componente independiente que no necesita ser declarado en un NgModule
  standalone: true,
  // imports: módulos requeridos por este componente
  // RouterModule proporciona directivas como routerLink y router-outlet
  imports: [RouterModule],
  // templateUrl: ruta al archivo HTML con la estructura visual del componente
  templateUrl: './barra-navegacion-veterinario.html',
  // styleUrl: ruta al archivo CSS con estilos específicos para este componente
  styleUrl: './barra-navegacion-veterinario.css',
})
// Clase que representa la barra de navegación específica para el rol de veterinario
// No contiene lógica porque la navegación se maneja declarativamente en el template
export class BarraNavegacionVeterinario {
  // Clase vacía: componente puramente de presentación
  // La navegación se define en el HTML usando directivas de RouterModule
}
