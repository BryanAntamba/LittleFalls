// Importación del decorador Component desde el core de Angular
import { Component } from '@angular/core';
// Importación del componente de pie de página
import { PiePagina } from '../pie-pagina/pie-pagina';
// Importación de Router para navegación programática y RouterModule para directivas
import { Router, RouterModule } from '@angular/router';
// Importación de CommonModule para directivas estructurales (*ngIf, *ngFor)
import { CommonModule } from '@angular/common';
// Importación de FormsModule para enlace bidireccional de datos (ngModel)
import { FormsModule } from '@angular/forms';

// Decorador que define los metadatos del componente
@Component({
  // selector: nombre del tag HTML personalizado
  selector: 'app-recuperacion-pasword',
  // standalone: componente independiente (no requiere NgModule)
  standalone: true,
  // imports: módulos necesarios
  // RouterModule: para routerLink en el template
  // PiePagina: componente del pie de página
  // CommonModule: para *ngIf y otras directivas
  // FormsModule: para ngModel (enlace bidireccional)
  imports: [RouterModule, PiePagina, CommonModule, FormsModule],
  // templateUrl: archivo HTML con la vista
  templateUrl: './recuperacion-pasword.html',
  // styleUrl: archivo CSS con los estilos
  styleUrl: './recuperacion-pasword.css',
})
// Clase que maneja la recuperación de contraseña (paso 1: solicitar código)
export class RecuperacionPasword {
  // Propiedad que almacena el correo ingresado por el usuario
  correo: string = '';
  // Bandera que indica si se está procesando una solicitud (para mostrar spinner/loading)
  cargando: boolean = false;
  // Variable para almacenar mensaje de error específico del campo correo
  errorCorreo: string = '';
  // Variable para mensajes de error generales (del servidor)
  errorGeneral: string = '';
  // Variable para mensajes de éxito
  successMessage: string = '';

  // Constructor que inyecta el Router para navegación programática
  constructor(private router: Router) {}

  // Método que se ejecuta al escribir en el campo de correo
  // Actualmente no hace filtrado en tiempo real, solo al enviar el formulario
  filterCorreo(event: any) {
    // No hacer nada, permitir cualquier carácter
    // La validación se hará solo al hacer click en Enviar Código
    // Esto da flexibilidad al usuario para escribir mientras escribe
  }

  // Método asíncrono que solicita el código de recuperación al backend
  async solicitarRecuperacion() {
    // Limpiar todos los mensajes de error y éxito previos
    // Esto evita confusión al usuario mostrando mensajes antiguos
    this.errorCorreo = '';
    this.errorGeneral = '';
    this.successMessage = '';

    // Validación 1: Verificar que el campo no esté vacío
    // trim() elimina espacios en blanco al inicio y final
    if (!this.correo || this.correo.trim() === '') {
      // Asignar mensaje de error específico al campo
      this.errorCorreo = 'Por favor ingresa tu correo electrónico';
      // return detiene la ejecución del método
      return;
    }

    // Normalizar el correo: eliminar espacios y convertir a minúsculas
    // toLowerCase() asegura comparación case-insensitive
    const correoTrimmed = this.correo.trim().toLowerCase();
    
    // Validación 2: Verificar que termine en @gmail.com (dominio permitido)
    // endsWith() verifica si un string termina con cierto patrón
    if (!correoTrimmed.endsWith('@gmail.com')) {
      this.errorCorreo = 'El correo debe tener el formato usuario@gmail.com';
      return;
    } 
    // Validación 3: Verificar formato completo con expresión regular
    // ^[A-Za-z0-9._\-]+ : uno o más caracteres alfanuméricos, puntos, guiones bajos o guiones
    // @ : arroba obligatoria
    // gmail\.com$ : debe terminar exactamente con gmail.com (\ escapa el punto)
    else if (!/^[A-Za-z0-9._\-]+@gmail\.com$/.test(correoTrimmed)) {
      this.errorCorreo = 'Por favor ingresa un correo válido (ej: usuario@gmail.com)';
      return;
    }

    // Activar bandera de carga para mostrar indicador visual al usuario
    this.cargando = true;

    // Bloque try-catch para manejar errores de red o del servidor
    try {
      // fetch() realiza petición HTTP POST al endpoint de recuperación
      // await pausa la ejecución hasta que la promesa se resuelva
      const response = await fetch('http://localhost:3000/api/auth/recuperar-password/solicitar', {
        // method: tipo de petición HTTP (POST para enviar datos)
        method: 'POST',
        // headers: configuración de la petición
        // Content-Type indica que enviamos JSON
        headers: { 'Content-Type': 'application/json' },
        // body: datos a enviar, convertidos a string JSON
        // JSON.stringify() convierte objeto JS a formato JSON
        body: JSON.stringify({ correo: this.correo.trim() })
      });

      // Convertir la respuesta del servidor de JSON a objeto JavaScript
      // await espera a que se complete la lectura del cuerpo de la respuesta
      const resultado = await response.json();

      // Verificar si la operación fue exitosa según la respuesta del backend
      if (resultado.success) {
        // Mostrar mensaje de éxito al usuario
        this.successMessage = 'Se ha enviado un código de recuperación a tu correo electrónico. Por favor revisa tu bandeja de entrada.';
        // Navegar a la pantalla de verificación de código
        // navigate() cambia la ruta actual
        // queryParams: parámetros de URL que se pasan a la siguiente pantalla
        this.router.navigate(['/VerificarCodigoRecuperacion'], { 
          // Pasar el correo para que la siguiente pantalla lo use
          // tipo: 'recuperacion' diferencia este flujo del flujo de registro
          queryParams: { correo: this.correo.trim(), tipo: 'recuperacion' } 
        });
      } else {
        // Si el backend retorna success: false, mostrar el mensaje de error
        // || operador OR: si resultado.mensaje no existe, usa el mensaje por defecto
        this.errorGeneral = resultado.mensaje || 'Error al procesar la solicitud';
      }
    } catch (error) {
      // Bloque catch captura errores de red (servidor caído, sin internet, etc.)
      // console.error() imprime el error en la consola del navegador para debugging
      console.error('Error:', error);
      // Mostrar mensaje genérico de error de conexión
      this.errorGeneral = 'Error de conexión con el servidor. Por favor intenta de nuevo.';
    } finally {
      // Bloque finally se ejecuta SIEMPRE, haya éxito o error
      // Desactivar el indicador de carga
      this.cargando = false;
    }
  }

  // Método para limpiar todos los mensajes de error y éxito
  // Se puede llamar cuando el usuario comienza a escribir de nuevo
  clearError() {
    this.errorCorreo = '';
    this.errorGeneral = '';
    this.successMessage = '';
  }
}
