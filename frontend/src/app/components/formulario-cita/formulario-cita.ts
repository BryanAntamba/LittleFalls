// Importación del decorador Component desde el core de Angular para definir componentes
import { Component } from '@angular/core';
// Importación del componente de barra de navegación para mostrar en el template
import { BarraNavegacion } from '../barra-navegacion/barra-navegacion';
// Importación del componente de pie de página
import { PiePagina } from '../pie-pagina/pie-pagina';
// Router para navegación programática y RouterModule para directivas de enrutamiento
import { Router, RouterModule } from '@angular/router';
// CommonModule para directivas estructurales (*ngIf, *ngFor)
import { CommonModule } from '@angular/common';
// FormsModule para enlace bidireccional de datos con [(ngModel)]
import { FormsModule } from '@angular/forms';
// Servicio de citas para operaciones CRUD de citas
import { CitasService } from '../../services/citas.service';
// Servicio de alertas para mostrar mensajes al usuario
import { AlertService } from '../../services/alert.service';
// Servicio de autenticación para obtener datos del usuario logueado
import { AuthService } from '../../services/auth.service';

// Decorador que define los metadatos del componente
@Component({
  // selector: nombre del tag HTML personalizado
  selector: 'app-formulario-cita',
  // standalone: componente independiente (no requiere NgModule)
  standalone: true,
  // imports: módulos y componentes necesarios
  imports: [BarraNavegacion, PiePagina, RouterModule, CommonModule, FormsModule],
  // templateUrl: ruta al archivo HTML con la vista
  templateUrl: './formulario-cita.html',
  // styleUrl: ruta al archivo CSS con estilos
  styleUrl: './formulario-cita.css',
})
// Clase que representa el formulario de agendamiento de citas (paso 2 de 2)
export class FormularioCita {
  // Bandera para indicar si hay una operación en curso (muestra spinner)
  cargando = false;
  
  // Objeto que almacena todos los datos de la cita a agendar
  // Se enlaza con ngModel en el template para two-way binding
  cita = {
    // Datos del paciente (dueño de la mascota)
    nombrePaciente: '',      // Nombre del paciente
    apellidoPaciente: '',    // Apellido del paciente
    correoPaciente: '',      // Correo electrónico del paciente
    telefonoPaciente: '',    // Teléfono de contacto (10 dígitos)
    // Datos de la mascota
    nombreMascota: '',       // Nombre de la mascota
    edadMascota: 0,          // Edad de la mascota en años
    tipoMascota: 'Perro',    // Tipo de mascota (Perro/Gato) - valor por defecto: 'Perro'
    sexoMascota: 'Macho',    // Sexo de la mascota (Macho/Hembra) - valor por defecto: 'Macho'
    // Datos de la cita (fecha y hora vienen del paso anterior)
    fecha: '',               // Fecha de la cita en formato YYYY-MM-DD
    hora: '',                // Hora de la cita en formato 12h (ej: "9:00 AM")
    descripcion: ''          // Descripción del motivo de la consulta
  };

  // Constructor que inyecta las dependencias necesarias
  constructor(
    // CitasService: servicio para crear y gestionar citas
    private citasService: CitasService,
    // AlertService: servicio para mostrar mensajes de error/éxito
    private alertService: AlertService,
    // AuthService: servicio para obtener información del usuario autenticado
    private authService: AuthService,
    // Router: servicio para navegación programática
    private router: Router
  ) {
    // En el constructor, recuperar fecha y hora del localStorage
    // Estos datos fueron guardados en el componente anterior (AgendarCita)
    // getItem() retorna string o null si la clave no existe
    const fechaCita = localStorage.getItem('fechaCita');
    const horaCita = localStorage.getItem('horaCita');
    
    // Si existe fecha guardada, asignarla al modelo de la cita
    if (fechaCita) this.cita.fecha = fechaCita;
    // Si existe hora guardada, asignarla al modelo de la cita
    if (horaCita) this.cita.hora = horaCita;
  }

  /**
   * Método que filtra la entrada en tiempo real para permitir solo letras
   * Se usa para campos de nombre (paciente, mascota)
   * @param event - Evento del input que contiene el valor ingresado
   * @param campo - Identificador del campo a actualizar ('nombre', 'apellido', 'nombreMascota')
   */
  filtrarSoloLetras(event: any, campo: string) {
    // Obtener referencia al elemento input del DOM
    const input = event.target;
    // Obtener el valor actual del input
    const value = input.value;
    // Aplicar filtro con regex que solo permite letras (incluye acentos), ñ y espacios
    // /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g : regex global que busca caracteres NO permitidos
    // [^ ] : conjunto negado (todo lo que NO esté en la lista se elimina)
    // a-zA-Z : letras inglesas mayúsculas y minúsculas
    // áéíóúÁÉÍÓÚ : vocales con acento
    // ñÑ : letra ñ española
    // \s : espacios en blanco
    // g : flag global (reemplaza todas las ocurrencias)
    const filtrado = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    // Actualizar el valor visual del input con el texto filtrado
    input.value = filtrado;
    
    // Actualizar la propiedad correspondiente del modelo según el campo
    // Usar condicionales para determinar qué propiedad actualizar
    if (campo === 'nombre') this.cita.nombrePaciente = filtrado;
    else if (campo === 'apellido') this.cita.apellidoPaciente = filtrado;
    else if (campo === 'nombreMascota') this.cita.nombreMascota = filtrado;
  }

  /**
   * Método que filtra la entrada del teléfono para permitir solo números
   * Limita la longitud a máximo 10 dígitos (estándar telefónico mexicano)
   * @param event - Evento del input de teléfono
   */
  filtrarTelefono(event: any) {
    // Obtener referencia al elemento input
    const input = event.target;
    // Obtener valor actual
    const value = input.value;
    // Aplicar dos filtros en cadena:
    // 1. replace(/[^0-9]/g, '') : elimina todo lo que NO sea dígito (0-9)
    // 2. substring(0, 10) : limita a máximo 10 caracteres
    const filtrado = value.replace(/[^0-9]/g, '').substring(0, 10);
    // Actualizar valor visual
    input.value = filtrado;
    // Actualizar modelo
    this.cita.telefonoPaciente = filtrado;
  }

  /**
   * Método que filtra la descripción permitiendo letras, números, espacios, comas y puntos
   * Se usa para el campo de descripción del motivo de la consulta
   * @param event - Evento del input de descripción
   */
  filtrarDescripcion(event: any) {
    // Obtener referencia al input
    const input = event.target;
    // Obtener valor actual
    const value = input.value;
    // Regex que permite: letras (con acentos), números, espacios, comas y puntos
    // /[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,]/g
    // Elimina símbolos especiales, emojis, etc.
    const filtrado = value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,]/g, '');
    // Actualizar valor visual
    input.value = filtrado;
    // Actualizar modelo
    this.cita.descripcion = filtrado;
  }

  // Método asíncrono principal que agenda la cita enviando datos al backend
  // async permite usar await para manejar promesas de forma síncrona
  async agendarCita() {
    // Validar formulario completo antes de enviar datos
    // Si hay errores de validación, validarFormulario() retorna false y detiene el proceso
    if (!this.validarFormulario()) {
      return; // Detener ejecución si hay errores
    }

    // Activar indicador de carga para mostrar spinner al usuario
    this.cargando = true;

    // Bloque try-catch para manejar errores de red o del servidor
    try {
      // Obtener datos del usuario autenticado desde AuthService
      // getUsuario() retorna el objeto de usuario desde localStorage
      const usuario = this.authService.getUsuario();
      
      // Convertir hora de formato 12 horas (9:00 AM) a formato 24 horas (09:00:00)
      // Necesario para crear objeto Date válido
      const hora24 = this.convertirHora12a24(this.cita.hora);
      
      // Combinar fecha (YYYY-MM-DD) y hora (HH:mm:ss) para crear objeto Date completo
      // Template string permite incrustar variables con ${variable}
      // Formato: "2024-01-15T09:00:00"
      const fechaHora = new Date(`${this.cita.fecha}T${hora24}`);
      
      // Construir objeto con todos los datos de la cita para enviar al backend
      const datos = {
        // ID del paciente (puede ser null si no está autenticado)
        // Operador ternario: condición ? siTrue : siFalse
        pacienteId: usuario ? usuario._id : null,
        // Datos del paciente
        nombrePaciente: this.cita.nombrePaciente,
        apellidoPaciente: this.cita.apellidoPaciente,
        correoPaciente: this.cita.correoPaciente,
        telefonoPaciente: this.cita.telefonoPaciente,
        // Datos de la mascota
        nombreMascota: this.cita.nombreMascota,
        // Number() convierte string a número
        edadMascota: Number(this.cita.edadMascota),
        tipoMascota: this.cita.tipoMascota,    // 'Perro' o 'Gato'
        sexoMascota: this.cita.sexoMascota,    // 'Macho' o 'Hembra'
        // Fecha y hora de la cita
        // toISOString() convierte Date a formato ISO 8601 (estándar internacional)
        // Ejemplo: "2024-01-15T09:00:00.000Z"
        fecha: fechaHora.toISOString(),
        hora: this.cita.hora,                  // Mantener formato 12h para mostrar
        descripcion: this.cita.descripcion     // Motivo de la consulta
      };

      // console.log() imprime en consola del navegador para debugging
      console.log('Datos a enviar:', datos);

      // Llamar al servicio para crear la cita en el backend
      // await pausa la ejecución hasta que la promesa se resuelva
      const resultado = await this.citasService.crearCita(datos);

      // Imprimir respuesta del servidor para debugging
      console.log('Resultado del servidor:', resultado);

      // Verificar si la operación fue exitosa
      if (resultado.success) {
        // Mostrar mensaje de éxito al usuario
        this.alertService.success('Cita agendada exitosamente');
        // Limpiar datos temporales del localStorage ya que se usaron
        // removeItem() elimina una entrada del localStorage
        localStorage.removeItem('fechaCita');
        localStorage.removeItem('horaCita');
        // Navegar a la página de inicio después de agendar
        // navigate(['/']) lleva a la ruta raíz
        this.router.navigate(['/']);
      } else {
        // Si el backend retorna success: false
        // Mostrar mensaje de error del servidor
        // || operador OR: usa mensaje por defecto si resultado.mensaje no existe
        this.alertService.error(resultado.mensaje || 'Error al agendar cita');
      }
    } catch (error) {
      // Bloque catch captura errores de red (servidor caído, timeout, etc.)
      // console.error() imprime error en consola con formato de error
      console.error('Error completo:', error);
      // Mostrar mensaje genérico de error de conexión
      this.alertService.error('Error de conexión con el servidor');
    } finally {
      // Bloque finally se ejecuta SIEMPRE, haya éxito o error
      // Desactivar indicador de carga
      this.cargando = false;
    }
  }

  // Método que convierte hora de formato 12h a formato 24h
  // Necesario para crear objetos Date válidos
  // @param hora12 - String en formato "9:00 AM" o "2:30 PM"
  // @returns String en formato "09:00:00" o "14:30:00"
  convertirHora12a24(hora12: string): string {
    // split(' ') divide el string por espacios
    // Ejemplo: "9:00 AM" -> ["9:00", "AM"]
    // Destructuring assignment para extraer tiempo y periodo
    const [tiempo, periodo] = hora12.split(' ');
    // split(':') divide tiempo por dos puntos
    // Ejemplo: "9:00" -> ["9", "00"]
    // Extraer horas y minutos
    let [horas, minutos] = tiempo.split(':');
    
    // parseInt() convierte string a entero
    // Base 10 (decimal)
    let horasNum = parseInt(horas);
    
    // Lógica de conversión de 12h a 24h:
    // Si es PM y no es mediodía (12 PM), sumar 12 horas
    if (periodo === 'PM' && horasNum !== 12) {
      horasNum += 12; // Ejemplo: 2 PM -> 14
    } 
    // Si es AM y es medianoche (12 AM), convertir a 0
    else if (periodo === 'AM' && horasNum === 12) {
      horasNum = 0; // 12 AM -> 00:00
    }
    
    // Construir string en formato 24h
    // toString() convierte número a string
    // padStart(2, '0') añade ceros a la izquierda hasta tener 2 caracteres
    // Ejemplo: 9 -> "09", 14 -> "14"
    // || '00' usa "00" como minutos si minutos no existe
    // Template string con backticks para construir formato HH:mm:ss
    return `${horasNum.toString().padStart(2, '0')}:${minutos || '00'}:00`;
  }

  validarFormulario(): boolean {
    // Validar nombre - solo letras
    if (!this.cita.nombrePaciente || this.cita.nombrePaciente.trim() === '') {
      this.alertService.error('Por favor ingrese su nombre');
      return false;
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(this.cita.nombrePaciente)) {
      this.alertService.error('El nombre solo puede contener letras');
      return false;
    }

    // Validar apellido - solo letras
    if (!this.cita.apellidoPaciente || this.cita.apellidoPaciente.trim() === '') {
      this.alertService.error('Por favor ingrese su apellido');
      return false;
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(this.cita.apellidoPaciente)) {
      this.alertService.error('El apellido solo puede contener letras');
      return false;
    }

    // Validar correo - solo @gmail.com o @hotmail.com
    if (!this.cita.correoPaciente || this.cita.correoPaciente.trim() === '') {
      this.alertService.error('Por favor ingrese su correo electrónico');
      return false;
    }
    const correoLower = this.cita.correoPaciente.toLowerCase();
    if (!correoLower.endsWith('@gmail.com') && !correoLower.endsWith('@hotmail.com')) {
      this.alertService.error('El correo debe terminar en @gmail.com o @hotmail.com');
      return false;
    }
    if (!/^[A-Za-z0-9._\-]+@(gmail|hotmail)\.com$/.test(correoLower)) {
      this.alertService.error('Formato de correo inválido');
      return false;
    }

    // Validar teléfono - exactamente 10 dígitos
    if (!this.cita.telefonoPaciente || this.cita.telefonoPaciente.trim() === '') {
      this.alertService.error('Por favor ingrese su teléfono');
      return false;
    }
    if (!/^\d{10}$/.test(this.cita.telefonoPaciente)) {
      this.alertService.error('El teléfono debe tener exactamente 10 dígitos');
      return false;
    }

    // Validar nombre mascota - solo letras
    if (!this.cita.nombreMascota || this.cita.nombreMascota.trim() === '') {
      this.alertService.error('Por favor ingrese el nombre de su mascota');
      return false;
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(this.cita.nombreMascota)) {
      this.alertService.error('El nombre de la mascota solo puede contener letras');
      return false;
    }

    // Validar edad mascota - máximo 20 años
    if (!this.cita.edadMascota || this.cita.edadMascota <= 0) {
      this.alertService.error('Por favor ingrese una edad válida para su mascota');
      return false;
    }
    if (this.cita.edadMascota > 20) {
      this.alertService.error('La edad de la mascota no puede superar los 20 años');
      return false;
    }

    // Validar descripción - debe contener al menos una letra
    if (!this.cita.descripcion || this.cita.descripcion.trim() === '') {
      this.alertService.error('Por favor describa el motivo de la cita');
      return false;
    }
    if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(this.cita.descripcion)) {
      this.alertService.error('La descripción debe contener al menos una letra');
      return false;
    }

    if (!this.cita.fecha || !this.cita.hora) {
      this.alertService.error('Por favor seleccione fecha y hora');
      return false;
    }

    return true;
  }
}
