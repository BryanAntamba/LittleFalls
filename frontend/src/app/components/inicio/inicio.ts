// Importación del decorador Component desde el núcleo de Angular
import { Component } from '@angular/core';
// Importación del componente de barra de navegación para usuarios generales
import { BarraNavegacion } from "../barra-navegacion/barra-navegacion";
// Importación del componente de pie de página
import { PiePagina } from "../pie-pagina/pie-pagina";
// Importación de RouterModule para navegación y Router para navegación programática
import { RouterModule, Router } from "@angular/router";
// Importación del servicio de autenticación para verificar estado del usuario
import { AuthService } from '../../services/auth.service';

// Decorador @Component que define los metadatos del componente
@Component({
  // selector: nombre del tag HTML personalizado para este componente
  selector: 'app-inicio',
  // imports: componentes y módulos necesarios para este componente standalone
  // RouterModule: para directivas de enrutamiento (routerLink)
  // BarraNavegacion: componente de navegación superior
  // PiePagina: componente de pie de página
  imports: [RouterModule, BarraNavegacion, PiePagina],
  // templateUrl: ruta al archivo HTML con la estructura visual
  templateUrl: './inicio.html',
  // styleUrl: ruta al archivo CSS con estilos específicos
  styleUrl: './inicio.css',
})
// Clase que representa la página de inicio de la aplicación
export class Inicio {
  // Constructor que inyecta las dependencias necesarias
  // authService: para verificar autenticación y roles del usuario
  // router: para navegación programática entre rutas
  constructor(private authService: AuthService, private router: Router) {}

  // Método que maneja el click en el botón "Agendar Cita"
  agendarCita() {
    // Log para debugging: confirmar que el botón fue clickeado
    console.log('Botón clickeado');
    // Log para debugging: verificar si hay un usuario autenticado
    console.log('Usuario logueado:', this.authService.isLoggedIn());
    
    // Lógica condicional de navegación basada en el rol del usuario:
    // Si el usuario está autenticado Y tiene el rol de 'paciente'
    if (this.authService.hasRole('paciente')) {
      // Navegar a la página de agendamiento de citas
      // navigate() es un método del Router que cambia la ruta actual
      this.router.navigate(['/AgendamientoCita']);
    } else {
      // Si NO está autenticado o tiene otro rol (veterinario/admin)
      // Redirigir al login para que inicie sesión
      this.router.navigate(['/Login-LittleFalls']);
    }
  }
}
