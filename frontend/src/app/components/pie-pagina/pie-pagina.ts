// Importación del decorador Component desde el core de Angular
// Este decorador permite convertir una clase TypeScript en un componente Angular
import { Component } from '@angular/core';

// Decorador @Component que define los metadatos del componente
@Component({
  // selector: nombre del tag HTML que representa este componente (<app-pie-pagina></app-pie-pagina>)
  selector: 'app-pie-pagina',
  // standalone: indica que este es un componente independiente (no requiere NgModule)
  // Los componentes standalone son una característica moderna de Angular que simplifica la arquitectura
  standalone: true,
  // imports: array de módulos y componentes que este componente necesita
  // Vacío porque este componente no usa otros componentes ni directivas
  imports: [],
  // templateUrl: ruta al archivo HTML que contiene la plantilla del componente
  templateUrl: './pie-pagina.html',
  // styleUrl: ruta al archivo CSS que contiene los estilos específicos del componente
  styleUrl: './pie-pagina.css',
})
// Clase que representa el componente de pie de página
// No contiene lógica porque es un componente puramente presentacional
export class PiePagina {
  // Clase vacía: el componente solo muestra contenido estático en su template HTML
}
