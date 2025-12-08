// Importación del decorador Component desde el núcleo de Angular
import { Component } from '@angular/core';
// Importación de RouterModule y Router para funcionalidad de navegación
// RouterModule: proporciona directivas como routerLink
// Router: permite navegación programática
import { RouterModule, Router } from "@angular/router";
// Importación de CommonModule para directivas comunes de Angular (ngIf, ngFor, etc.)
import { CommonModule } from '@angular/common';
// Importación del servicio de autenticación para gestionar sesión y roles del usuario
import { AuthService } from '../../services/auth.service';

// Decorador que define los metadatos del componente
@Component({
  // selector: tag HTML personalizado para usar este componente
  selector: 'app-barra-navegacion',
  // imports: módulos necesarios para este componente standalone
  // RouterModule: para navegación declarativa
  // CommonModule: para directivas estructurales (ngIf, ngFor)
  imports: [RouterModule, CommonModule],
  // templateUrl: archivo HTML con la estructura visual del componente
  templateUrl: './barra-navegacion.html',
  // styleUrl: archivo CSS con estilos específicos
  styleUrl: './barra-navegacion.css',
})
// Clase que representa la barra de navegación principal para usuarios pacientes
export class BarraNavegacion {
  // Constructor que inyecta las dependencias
  // authService es público para que el template pueda acceder a sus métodos
  // router es privado porque solo se usa internamente en la clase
  constructor(public authService: AuthService, private router: Router) {}

  // Getter que retorna el objeto de usuario actual
  // Permite usar {{ usuario.nombre }} en el template
  get usuario() {
    // Llama al método del servicio que retorna los datos del usuario desde localStorage
    return this.authService.getUsuario();
  }

  // Getter que verifica si el usuario actual tiene el rol de 'paciente'
  // Retorna true/false para uso en directivas *ngIf del template
  get esPaciente() {
    // hasRole() verifica si el usuario autenticado tiene un rol específico
    return this.authService.hasRole('paciente');
  }

  // Getter que verifica si existe una sesión activa
  // Retorna true si hay un token válido en localStorage
  get estaLogueado() {
    // isLoggedIn() verifica la existencia de token de autenticación
    return this.authService.isLoggedIn();
  }

  // Método para cerrar la sesión del usuario
  cerrarSesion() {
    // logout() elimina el token y datos de usuario de localStorage
    // y redirige automáticamente a la página de login
    this.authService.logout();
  }

  // Método que maneja la navegación hacia la sección de citas
  irACitas() {
    // Verifica primero si el usuario está autenticado
    if (this.estaLogueado) {
      // Si está logueado, permitir acceso a la página de agendamiento
      // navigate() cambia la ruta actual de la aplicación
      this.router.navigate(['/AgendamientoCita']);
    } else {
      // Si NO está autenticado, redirigir al login
      // Esto protege rutas que requieren autenticación
      this.router.navigate(['/Login-LittleFalls']);
    }
  }
}
