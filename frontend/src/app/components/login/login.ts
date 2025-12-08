// Importación del decorador Component para definir componentes Angular
import { Component } from '@angular/core';
// Importación del componente de pie de página para usar en el template
import { PiePagina } from '../pie-pagina/pie-pagina';
// Router para navegación y RouterModule para directivas de enrutamiento
import { Router, RouterModule } from '@angular/router';
// CommonModule para directivas comunes (ngIf, ngFor, etc.)
import { CommonModule } from '@angular/common';
// FormsModule para formularios con ngModel (two-way binding)
import { FormsModule } from '@angular/forms';
// Servicio de autenticación para manejar login
import { AuthService } from '../../services/auth.service';
// ChangeDetectorRef para forzar detección de cambios manual
import { ChangeDetectorRef } from '@angular/core';

// Decorador Component con metadatos del componente
@Component({
  selector: 'app-login', // Selector HTML para usar este componente
  standalone: true, // Componente standalone (no requiere módulo)
  // Importaciones de módulos y componentes necesarios
  imports: [RouterModule, PiePagina, CommonModule, FormsModule],
  templateUrl: './login.html', // Ruta al template HTML
  styleUrl: './login.css', // Ruta a los estilos CSS
})
export class Login {
  // Controla la visibilidad de la contraseña (mostrar/ocultar)
  showPassword: boolean = false;
  
  // Modelo para el campo de correo (two-way binding con ngModel)
  correo: string = '';
  
  // Modelo para el campo de contraseña
  password: string = '';
  
  // Flag para mostrar spinner de carga durante la petición
  cargando: boolean = false;
  
  // Mensajes de error específicos para cada campo
  errorCorreo: string = ''; // Error del campo correo
  errorPassword: string = ''; // Error del campo contraseña
  errorGeneral: string = ''; // Error general de login
  
  // Mensaje de éxito (no usado actualmente pero disponible)
  successMessage: string = '';
  
  // Controla si se deben mostrar los errores en la UI
  // Solo se activa después de intentar enviar el formulario
  mostrarErrores: boolean = false;

  /**
   * Constructor con inyección de dependencias
   * @param router - Para navegar entre rutas
   * @param authService - Para manejar autenticación
   * @param cdr - Para forzar detección de cambios cuando sea necesario
   */
  constructor(private router: Router, private authService: AuthService, private cdr: ChangeDetectorRef) {}

  /**
   * Alterna la visibilidad de la contraseña
   * Cambia el tipo de input entre 'password' y 'text'
   * @param event - Evento del botón (opcional) para prevenir comportamiento por defecto
   */
  togglePassword(event?: any) {
    // Si hay evento, prevenir comportamiento por defecto
    if (event) {
      event.preventDefault(); // Prevenir submit del formulario
      event.stopPropagation(); // Detener propagación del evento
    }
    // Invertir el valor booleano (true ↔ false)
    this.showPassword = !this.showPassword;
  }

  /**
   * Filtra la entrada de la contraseña permitiendo solo letras y números
   * Previene caracteres especiales en tiempo real
   * @param event - Evento input del campo de contraseña
   */
  filterPassword(event: any) {
    // Obtener referencia al elemento input
    const input = event.target;
    // Obtener el valor actual del input
    const value = input.value;
    
    // Filtrar: eliminar todo lo que no sea A-Z, a-z, 0-9
    // Expresión regular: [^A-Za-z0-9] = cualquier caracter que NO sea letra o número
    // g = global (todas las ocurrencias)
    const filtrado = value.replace(/[^A-Za-z0-9]/g, '');
    
    // Actualizar el valor del input en el DOM
    input.value = filtrado;
    // Actualizar el modelo del componente
    this.password = filtrado;
  }

  /**
   * Maneja el proceso de inicio de sesión
   * Valida los datos, llama al servicio de autenticación y redirige según el rol
   */
  async iniciarSesion() {
    // Limpiar todos los mensajes de error previos
    this.errorCorreo = '';
    this.errorPassword = '';
    this.errorGeneral = '';
    this.successMessage = '';

    // ========== VALIDACIONES DEL LADO DEL CLIENTE ==========
    
    // Validar que el correo no esté vacío
    // trim() elimina espacios en blanco al inicio y final
    if (!this.correo || !this.correo.trim()) {
      this.errorCorreo = 'Por favor completa el correo';
      this.mostrarErrores = true; // Activar visualización de errores
      this.cdr.markForCheck(); // Forzar detección de cambios
      return; // Detener ejecución
    }

    // Validar formato de email con dominios específicos permitidos
    // Solo permite: @gmail.com, @littlefalls.com, @veterinario.com
    // ^ = inicio, [^\s@]+ = uno o más caracteres que no sean espacio ni @
    // @ = literal arroba
    // (gmail\.com|littlefalls\.com|veterinario\.com) = uno de estos dominios
    // \. = punto literal (escapado), $ = final
    const dominiosPermitidos = /^[^\s@]+@(gmail\.com|littlefalls\.com|veterinario\.com)$/;
    if (!dominiosPermitidos.test(this.correo.trim())) {
      this.errorCorreo = 'Ingrese su correo correctamente';
      this.mostrarErrores = true;
      this.cdr.markForCheck();
      return;
    }

    // Validar que la contraseña no esté vacía
    if (!this.password || !this.password.trim()) {
      this.errorPassword = 'Por favor completa la contraseña';
      this.mostrarErrores = true;
      this.cdr.markForCheck();
      return;
    }

    // Activar indicador de carga (muestra spinner en la UI)
    this.cargando = true;

    try {
      // Llamar al servicio de autenticación con credenciales
      // trim() asegura que no haya espacios extras
      // await espera la respuesta del servidor (operación asíncrona)
      const resultado = await this.authService.login(this.correo.trim(), this.password);

      // Desactivar indicador de carga
      this.cargando = false;

      // Verificar si el login fue exitoso
      if (resultado.success) {
        // Redirigir automáticamente según el rol del usuario
        // El backend retorna el tipo de usuario en resultado.usuario.tipoUsuario
        // redirectToDashboard maneja la navegación según el rol
        this.authService.redirectToDashboard(resultado.usuario.tipoUsuario);
      } else {
        // Si el login falló, mostrar errores
        this.mostrarErrores = true;
        
        // Si el backend envió errores específicos (array de mensajes)
        if (resultado.errores && resultado.errores.length > 0) {
          // Unir todos los errores con saltos de línea
          this.errorGeneral = resultado.errores.join(' \n ');
        } else {
          // Si no hay errores específicos, usar mensaje genérico
          this.errorGeneral = resultado.mensaje || 'Credenciales incorrectas';
        }
        
        // Forzar detección de cambios para actualizar la UI
        this.cdr.markForCheck();
      }
    } catch (error) {
      // Capturar errores de red o del servidor
      this.cargando = false;
      this.mostrarErrores = true;
      this.errorGeneral = 'Error de conexión con el servidor. Por favor intenta de nuevo.';
      this.cdr.markForCheck();
    }
  }

  /**
   * Limpia los mensajes de error cuando el usuario comienza a escribir
   * Mejora la UX al no mostrar errores mientras el usuario corrige
   * @param field - Campo a limpiar ('correo', 'password', 'general')
   */
  clearError(field: string) {
    // Desactivar visualización de errores
    this.mostrarErrores = false;
    
    // Limpiar el error específico según el campo
    if (field === 'correo') this.errorCorreo = '';
    if (field === 'password') this.errorPassword = '';
    if (field === 'general') this.errorGeneral = '';
    
    // Limpiar también mensaje de éxito
    this.successMessage = '';
  }
}
