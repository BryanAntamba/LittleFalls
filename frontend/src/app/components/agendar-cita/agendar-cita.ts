// Importación del decorador Component desde el core de Angular
import { Component } from '@angular/core';
// Importación del componente de barra de navegación
import { BarraNavegacion } from "../barra-navegacion/barra-navegacion";
// Importación del componente de pie de página
import { PiePagina } from "../pie-pagina/pie-pagina";
// Importación de Router para navegación programática y RouterModule para directivas
import { Router, RouterModule } from '@angular/router';
// Importación de CommonModule para directivas estructurales (*ngIf, *ngFor)
import { CommonModule } from '@angular/common';
// Importación de FormsModule para enlace bidireccional de datos [(ngModel)]
import { FormsModule } from '@angular/forms';
// Importación del servicio de alertas para mostrar mensajes al usuario
import { AlertService } from '../../services/alert.service';

// Decorador que define los metadatos del componente
@Component({
  // selector: nombre del elemento HTML personalizado
  selector: 'app-agendar-cita',
  // imports: módulos y componentes necesarios para este componente standalone
  imports: [RouterModule, BarraNavegacion, PiePagina, CommonModule, FormsModule],
  // templateUrl: ruta al archivo HTML con la vista
  templateUrl: './agendar-cita.html',
  // styleUrl: ruta al archivo CSS con estilos
  styleUrl: './agendar-cita.css',
})
// Clase que maneja la selección de fecha y hora para agendar una cita (paso 1 de 2)
export class AgendarCita {
  // Propiedad que almacena la hora seleccionada por el usuario (formato: "9:00 AM", "2:00 PM")
  horaSeleccionada = '';
  // Propiedad que almacena la fecha seleccionada (formato: "YYYY-MM-DD")
  fechaSeleccionada = '';
  // Propiedad que define la fecha mínima seleccionable (hoy)
  // Evita que se agenden citas en fechas pasadas
  fechaMinima = '';
  // Bandera que indica si se está verificando disponibilidad en el backend
  verificando = false;

  // Constructor que inyecta las dependencias necesarias
  constructor(
    // Router: para navegar programáticamente al siguiente paso
    private router: Router,
    // AlertService: para mostrar mensajes de error/éxito al usuario
    private alertService: AlertService
  ) {
    // Obtener la fecha actual del sistema
    const hoy = new Date();
    // Convertir la fecha a formato ISO (YYYY-MM-DDTHH:mm:ss.sssZ)
    // split('T')[0] extrae solo la parte de fecha (YYYY-MM-DD)
    // Esto se usa como valor del atributo "min" en el input type="date"
    this.fechaMinima = hoy.toISOString().split('T')[0];
  }

  // Método asíncrono que se ejecuta al hacer click en "Siguiente"
  async siguientePaso() {
    // Validación: verificar que el usuario haya seleccionado tanto fecha como hora
    // ! operador NOT: convierte valores truthy/falsy en booleanos
    // || operador OR: retorna true si cualquiera de las condiciones es verdadera
    if (!this.horaSeleccionada || !this.fechaSeleccionada) {
      // Mostrar mensaje de error usando el servicio de alertas
      this.alertService.error('Por favor seleccione fecha y hora');
      // return detiene la ejecución del método
      return;
    }

    // Verificar disponibilidad antes de continuar al siguiente paso
    // Activar indicador de carga
    this.verificando = true;
    
    // Bloque try-catch para manejar errores durante la verificación
    try {
      // Llamar al método que consulta el backend sobre disponibilidad
      // await pausa la ejecución hasta obtener respuesta
      const disponible = await this.verificarDisponibilidad(this.fechaSeleccionada, this.horaSeleccionada);
      
      // Si la fecha/hora NO está disponible (ya fue agendada por otro usuario)
      if (!disponible) {
        // Mostrar mensaje de error informativo
        this.alertService.error('Ese día y hora ya no están disponibles para agendar una cita. Por favor, intente con otra hora o día.');
        // Desactivar indicador de carga
        this.verificando = false;
        // Detener ejecución para que el usuario elija otra hora
        return;
      }

      // Si está disponible, guardar los datos en localStorage
      // localStorage: almacenamiento persistente en el navegador
      // setItem(key, value): guarda un par clave-valor
      // Guardamos la hora seleccionada para usarla en el siguiente paso
      localStorage.setItem('horaCita', this.horaSeleccionada);
      // Guardamos la fecha seleccionada para usarla en el siguiente paso
      localStorage.setItem('fechaCita', this.fechaSeleccionada);
      
      // Navegar al siguiente paso: formulario con datos del paciente y mascota
      // navigate() cambia la ruta actual de la aplicación
      this.router.navigate(['/FormularioCita']);
    } catch (error) {
      // Bloque catch captura cualquier error durante la verificación
      // console.error() imprime el error en la consola para debugging
      console.error('Error al verificar disponibilidad:', error);
      // Mostrar mensaje de error genérico al usuario
      this.alertService.error('Error al verificar disponibilidad. Por favor intente nuevamente.');
    } finally {
      // Bloque finally se ejecuta SIEMPRE, haya éxito o error
      // Desactivar el indicador de carga
      this.verificando = false;
    }
  }

  // Método asíncrono que verifica en el backend si una fecha/hora está disponible
  // Retorna una Promise que resuelve a boolean (true = disponible, false = ocupado)
  async verificarDisponibilidad(fecha: string, hora: string): Promise<boolean> {
    // Bloque try-catch para manejar errores de red
    try {
      // Convertir la fecha de string a objeto Date
      // Se añade 'T00:00:00' para establecer la hora a medianoche
      // Esto normaliza la fecha para evitar problemas de zona horaria
      const fechaISO = new Date(fecha + 'T00:00:00').toISOString();
      
      // fetch() realiza petición HTTP POST al endpoint de verificación
      // await pausa hasta obtener respuesta
      const response = await fetch(`http://localhost:3000/api/citas/verificar-disponibilidad`, {
        // method: tipo de petición (POST para enviar datos)
        method: 'POST',
        // headers: configuración de la petición
        headers: {
          // Indicar que enviamos JSON en el cuerpo
          'Content-Type': 'application/json'
        },
        // body: datos a enviar en formato JSON string
        // JSON.stringify() convierte objeto JS a JSON
        body: JSON.stringify({ fecha: fechaISO, hora })
      });

      // Convertir la respuesta JSON del servidor a objeto JavaScript
      const resultado = await response.json();
      // Retornar el campo 'disponible' de la respuesta (true/false)
      return resultado.disponible;
    } catch (error) {
      // Si hay error de red, loguear en consola
      console.error('Error al verificar disponibilidad:', error);
      // Retornar false por seguridad (si no podemos verificar, asumimos no disponible)
      return false;
    }
  }

  /**
   * Método que valida que la fecha seleccionada no sea una fecha pasada
   * Se ejecuta cuando el usuario cambia la fecha en el input
   * @param event - Evento del input type="date"
   */
  validarFecha(event: any) {
    // Crear objeto Date desde el valor del input
    // Se añade 'T00:00:00' para establecer hora a medianoche
    const fechaSeleccionada = new Date(event.target.value + 'T00:00:00');
    // Obtener la fecha actual
    const hoy = new Date();
    // setHours(0,0,0,0) establece la hora a medianoche para comparar solo fechas
    // Esto evita que la hora actual afecte la comparación
    hoy.setHours(0, 0, 0, 0);
    
    // Verificar si la fecha seleccionada es anterior a hoy
    // Operador < compara timestamps (milisegundos desde 1970)
    if (fechaSeleccionada < hoy) {
      // Mostrar mensaje de error al usuario
      this.alertService.error('No se pueden agendar citas en fechas pasadas. Por favor seleccione una fecha futura.');
      // Limpiar el valor del input
      event.target.value = '';
      // Limpiar la propiedad del componente
      this.fechaSeleccionada = '';
    }
  }
}
