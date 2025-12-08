// Importación de Component: decorador para definir componentes
// OnInit: interfaz del ciclo de vida que ejecuta código al inicializar el componente
import { Component, OnInit } from '@angular/core';
// Router: servicio para navegación programática
// RouterModule: módulo con directivas de enrutamiento
// ActivatedRoute: servicio para acceder a parámetros de la ruta actual (query params, params)
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
// CommonModule: módulo con directivas comunes (*ngIf, *ngFor, pipes básicos)
import { CommonModule } from '@angular/common';
// FormsModule: módulo para enlace bidireccional de datos [(ngModel)]
import { FormsModule } from '@angular/forms';
// Servicio de autenticación (aunque no se usa mucho en este componente)
import { AuthService } from '../../services/auth.service';
// Servicio para mostrar alertas y mensajes al usuario
import { AlertService } from '../../services/alert.service';
// Componente del pie de página
import { PiePagina } from '../pie-pagina/pie-pagina';

// Decorador que convierte la clase en un componente Angular
@Component({
  // selector: nombre del tag HTML personalizado
  selector: 'app-verificar-codigo',
  // imports: módulos necesarios para este componente standalone
  imports: [RouterModule, CommonModule, FormsModule, PiePagina],
  // templateUrl: archivo HTML con la vista
  templateUrl: './verificar-codigo.html',
  // styleUrl: archivo CSS con estilos
  styleUrl: './verificar-codigo.css',
})
// Clase del componente que implementa OnInit
// OnInit: interfaz que requiere implementar ngOnInit()
export class VerificarCodigo implements OnInit {
  // Propiedad que almacena el correo del usuario (recibido por query params)
  correo: string = '';
  // Propiedad que almacena el código de 6 dígitos ingresado por el usuario
  codigo: string = '';
  // Bandera que indica si se está procesando la verificación
  cargando: boolean = false;
  // Bandera que indica si se está reenviando un nuevo código
  reenviando: boolean = false;
  // Tipo de verificación: 'registro' (cuenta nueva) o 'recuperacion' (contraseña olvidada)
  tipoVerificacion: string = 'registro'; // 'registro' o 'recuperacion'

  // Constructor que inyecta las dependencias necesarias
  constructor(
    // Router: para navegar a otras rutas programáticamente
    private router: Router,
    // ActivatedRoute: para leer los query parameters de la URL actual
    private route: ActivatedRoute,
    // AuthService: servicio de autenticación (importado pero poco usado aquí)
    private authService: AuthService,
    // AlertService: para mostrar mensajes de error/éxito
    private alertService: AlertService
  ) {}

  // Método del ciclo de vida que se ejecuta una vez al inicializar el componente
  // Se usa para leer parámetros de la URL y configurar el estado inicial
  ngOnInit() {
    // Obtener el correo y tipo de los parámetros de la ruta (query params)
    // route.queryParams es un Observable que emite los query parameters
    // subscribe() se suscribe para recibir los valores
    this.route.queryParams.subscribe(params => {
      // Leer el parámetro 'correo' de la URL, usar string vacío si no existe
      // params['correo'] accede al valor del parámetro
      this.correo = params['correo'] || '';
      // Leer el parámetro 'tipo' para saber si es verificación de registro o recuperación
      // Por defecto es 'registro' si no se especifica
      this.tipoVerificacion = params['tipo'] || 'registro';
    });
  }

  // Método asíncrono que verifica el código ingresado contra el backend
  async verificarCodigo() {
    // Validación 1: Verificar que el código no esté vacío y tenga exactamente 6 caracteres
    // trim() elimina espacios en blanco
    // length !== 6 verifica la longitud exacta
    if (!this.codigo || this.codigo.trim().length !== 6) {
      // Mostrar error si no cumple la longitud
      this.alertService.error('Por favor ingresa el código de 6 dígitos');
      // return detiene la ejecución
      return;
    }

    // Validación 2: Verificar que solo contenga dígitos numéricos usando regex
    // ^\d{6}$ : expresión regular que valida exactamente 6 dígitos
    // ^ : inicio del string
    // \d : cualquier dígito (0-9)
    // {6} : exactamente 6 veces
    // $ : fin del string
    // ! operador NOT invierte el resultado del test
    if (!/^\d{6}$/.test(this.codigo.trim())) {
      // Mostrar error si contiene caracteres no numéricos
      this.alertService.error('El código debe contener solo 6 números');
      return;
    }

    // Activar indicador de carga para mostrar spinner al usuario
    this.cargando = true;

    // Bloque try-catch para manejar errores de red o del servidor
    try {
      // Seleccionar el endpoint correcto según el tipo de verificación
      // Operador ternario: condición ? valorSiTrue : valorSiFalse
      // Si es 'recuperacion' usa un endpoint, si no usa otro
      const endpoint = this.tipoVerificacion === 'recuperacion' 
        ? 'http://localhost:3000/api/auth/recuperar-password/verificar-codigo'
        : 'http://localhost:3000/api/auth/verificar-codigo';

      // fetch() realiza petición HTTP POST al endpoint seleccionado
      // await pausa la ejecución hasta obtener respuesta
      const response = await fetch(endpoint, {
        // method: tipo de petición HTTP
        method: 'POST',
        // headers: configuración de la petición
        headers: { 'Content-Type': 'application/json' },
        // body: datos a enviar en formato JSON
        // JSON.stringify() convierte objeto JS a string JSON
        body: JSON.stringify({
          // Enviar el correo del usuario
          correo: this.correo,
          // Enviar el código ingresado (con trim para eliminar espacios)
          codigo: this.codigo.trim()
        })
      });

      // Convertir la respuesta JSON del servidor a objeto JavaScript
      // await espera a que se complete la lectura del cuerpo
      const resultado = await response.json();
      // Desactivar indicador de carga
      this.cargando = false;

      // Verificar si la verificación fue exitosa según la respuesta del backend
      if (resultado.success) {
        // Si es flujo de recuperación de contraseña
        if (this.tipoVerificacion === 'recuperacion') {
          // Mostrar mensaje de éxito específico para recuperación
          this.alertService.success('Código verificado. Ahora puedes establecer tu nueva contraseña.');
          // Navegar a la pantalla de restablecer contraseña
          // navigate() cambia la ruta actual
          this.router.navigate(['/RestablecerPasword'], { 
            // queryParams: parámetros que se pasan en la URL
            queryParams: { 
              // Pasar el correo para que la siguiente pantalla lo use
              correo: this.correo,
              // Pasar el código verificado (necesario para autorizar el cambio de contraseña)
              codigo: this.codigo.trim()
            } 
          });
        } else {
          // Si es flujo de registro (verificación de cuenta nueva)
          // Mostrar mensaje de éxito para registro
          this.alertService.success('¡Cuenta verificada exitosamente! Ya puedes iniciar sesión');
          // Navegar al login para que el usuario inicie sesión
          this.router.navigate(['/Login-LittleFalls']);
        }
      } else {
        // Si el backend retorna success: false
        // Verificar si el código expiró (códigos tienen tiempo de vida limitado)
        if (resultado.codigoExpirado) {
          // confirm() muestra un diálogo de confirmación nativo del navegador
          // Retorna true si el usuario hace click en OK, false en Cancelar
          const reenviar = confirm(
            // Concatenar el mensaje del servidor con pregunta de confirmación
            resultado.mensaje + '\n\n¿Deseas recibir un nuevo código?'
          );
          // Si el usuario confirma que quiere reenviar
          if (reenviar) {
            // Llamar al método para solicitar un nuevo código
            this.reenviarCodigo();
          }
        } else {
          // Si no es código expirado, es otro tipo de error (código incorrecto, etc.)
          // Mostrar el mensaje de error del backend
          // || operador OR: usa mensaje por defecto si resultado.mensaje no existe
          this.alertService.error(resultado.mensaje || 'Error al verificar el código');
        }
      }
    } catch (error) {
      // Bloque catch captura errores de red (servidor caído, sin internet, etc.)
      // Desactivar indicador de carga
      this.cargando = false;
      // Mostrar mensaje genérico de error de conexión
      this.alertService.error('Error de conexión con el servidor. Por favor intenta de nuevo.');
    }
  }

  // Método asíncrono para reenviar un nuevo código de verificación
  async reenviarCodigo() {
    // Validación: verificar que tengamos el correo disponible
    if (!this.correo) {
      // Mostrar error si no hay correo (esto no debería pasar normalmente)
      this.alertService.error('Correo no disponible');
      return;
    }

    // Activar indicador de "reenviando" (diferente de "cargando")
    this.reenviando = true;

    // Bloque try-catch para manejar errores
    try {
      // Seleccionar el endpoint correcto según el tipo de verificación
      // Operador ternario para decidir qué endpoint usar
      const endpoint = this.tipoVerificacion === 'recuperacion'
        // Si es recuperación, usar el endpoint de solicitar código de recuperación
        ? 'http://localhost:3000/api/auth/recuperar-password/solicitar'
        // Si es registro, usar el endpoint de reenviar código de verificación
        : 'http://localhost:3000/api/auth/reenviar-codigo';

      // fetch() realiza petición HTTP POST
      // await pausa hasta obtener respuesta
      const response = await fetch(endpoint, {
        // Método POST para enviar datos
        method: 'POST',
        // Headers: indicar que enviamos JSON
        headers: { 'Content-Type': 'application/json' },
        // Body: enviar solo el correo
        // JSON.stringify() convierte objeto a JSON string
        body: JSON.stringify({ correo: this.correo })
      });

      // Convertir respuesta JSON a objeto JavaScript
      const resultado = await response.json();
      // Desactivar indicador de "reenviando"
      this.reenviando = false;

      // Verificar si el reenvío fue exitoso
      if (resultado.success) {
        // Mostrar mensaje de éxito del backend
        this.alertService.success(resultado.mensaje);
        // Limpiar el campo del código para que el usuario ingrese el nuevo
        this.codigo = ''; // Limpiar el campo
      } else {
        // Si falló, mostrar mensaje de error
        this.alertService.error(resultado.mensaje || 'Error al reenviar el código');
      }
    } catch (error) {
      // Bloque catch para errores de red
      // Desactivar indicador de "reenviando"
      this.reenviando = false;
      // Mostrar mensaje genérico de error de conexión
      this.alertService.error('Error de conexión con el servidor. Por favor intenta de nuevo.');
    }
  }

  // Método que previene la entrada de caracteres no numéricos en el input
  // Se ejecuta en el evento keypress del input
  // @param event - Evento del teclado que contiene información de la tecla presionada
  onlyNumbers(event: KeyboardEvent) {
    // Obtener el código de la tecla presionada
    // event.which es para navegadores antiguos, event.keyCode para compatibilidad
    const charCode = event.which ? event.which : event.keyCode;
    // Verificar si la tecla NO es un número
    // charCode > 31: excluir teclas de control (Enter, Backspace, Tab, etc.)
    // charCode < 48 || charCode > 57: excluir caracteres que no sean 0-9
    // Códigos ASCII: 48='0', 49='1', ... 57='9'
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      // preventDefault() cancela la acción por defecto (escribir el carácter)
      // Esto evita que se ingresen letras, símbolos, etc.
      event.preventDefault();
    }
  }
}
