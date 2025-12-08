// Importación del decorador Component desde el core de Angular
import { Component } from '@angular/core';
// Importación del módulo RouterModule para manejar navegación entre rutas
import { RouterModule } from '@angular/router';

// Decorador que define este componente de Angular
@Component({
  // selector: nombre del elemento HTML personalizado para usar este componente
  selector: 'app-barra-navegacion-admin',
  // standalone: true indica que este es un componente independiente (no requiere NgModule)
  standalone: true,
  // imports: módulos necesarios - RouterModule para directivas de enrutamiento (routerLink, routerLinkActive)
  imports: [RouterModule],
  // templateUrl: ruta al archivo HTML que define la estructura visual del componente
  templateUrl: './barra-navegacion-admin.html',
  // styleUrl: ruta al archivo CSS con los estilos específicos de este componente
  styleUrl: './barra-navegacion-admin.css',
})
// Clase exportable que representa la barra de navegación para el rol de administrador
// Es una clase vacía porque toda la funcionalidad de navegación está en el template HTML
// mediante directivas de RouterModule (routerLink para navegación declarativa)
export class BarraNavegacionAdmin {
  // Clase vacía: componente puramente presentacional sin lógica de negocio
}
