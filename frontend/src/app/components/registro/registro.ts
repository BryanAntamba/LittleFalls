// Importación del decorador Component desde el core de Angular
// Component es esencial para definir un componente Angular
import { Component } from '@angular/core';
// Importación del componente de pie de página para usarlo en este componente
import { PiePagina } from '../pie-pagina/pie-pagina';
// Router: servicio para navegación programática entre rutas
// RouterModule: módulo que proporciona directivas de enrutamiento (routerLink)
import { Router, RouterModule } from '@angular/router';
// CommonModule: módulo con directivas estructurales (*ngIf, *ngFor) y pipes básicos
import { CommonModule } from '@angular/common';
// FormsModule: módulo para formularios basados en plantilla con ngModel (two-way binding)
import { FormsModule } from '@angular/forms';
// Servicio de autenticación que maneja el registro de usuarios
import { AuthService } from '../../services/auth.service';

// Decorador @Component que define los metadatos del componente de registro
@Component({
  // selector: nombre del tag HTML personalizado (<app-registro></app-registro>)
  selector: 'app-registro',
  // imports: array de módulos y componentes que este componente standalone necesita
  // RouterModule: para directivas de navegación
  // PiePagina: componente del footer
  // CommonModule: para *ngIf, *ngFor
  // FormsModule: para [(ngModel)]
  imports: [RouterModule, PiePagina, CommonModule, FormsModule],
  // templateUrl: ruta al archivo HTML con la estructura visual del componente
  templateUrl: './registro.html',
  // styleUrl: ruta al archivo CSS con estilos específicos del componente
  styleUrl: './registro.css',
})
// Clase exportable que representa el componente de registro de usuarios
export class Registro {
  // Bandera que controla si la contraseña es visible (tipo text) u oculta (tipo password)
  showPassword: boolean = false;
  
  // Propiedad enlazada al input del nombre del usuario (two-way binding con ngModel)
  nombre: string = '';
  
  // Propiedad enlazada al input del apellido del usuario
  apellido: string = '';
  
  // Propiedad enlazada al input de la edad del usuario (tipo número)
  edad: number = 0;
  
  // Propiedad enlazada al input del correo electrónico
  correo: string = '';
  
  // Propiedad enlazada al input de la contraseña
  password: string = '';
  
  // Bandera que indica si hay una petición en curso (muestra spinner de carga)
  cargando: boolean = false;
  
  // Variables para almacenar mensajes de error específicos de cada campo
  // Permiten mostrar errores individuales bajo cada input
  errorNombre: string = '';      // Error del campo nombre
  errorApellido: string = '';    // Error del campo apellido
  errorEdad: string = '';        // Error del campo edad
  errorCorreo: string = '';      // Error del campo correo
  errorPassword: string = '';    // Error del campo contraseña
  errorGeneral: string = '';     // Error general del servidor o validaciones globales
  successMessage: string = '';   // Mensaje de éxito cuando el registro es exitoso

  // Constructor que inyecta las dependencias necesarias
  // private: hace que las propiedades solo sean accesibles dentro de la clase
  constructor(
    // Router: servicio para navegar programáticamente a otras rutas
    private router: Router,
    // AuthService: servicio que contiene la lógica de autenticación y registro
    private authService: AuthService
  ) {}

  // Método que alterna la visibilidad de la contraseña
  // Se ejecuta al hacer click en el ícono de ojo
  togglePassword() {
    // ! operador NOT invierte el valor booleano
    // Si showPassword es true, se vuelve false y viceversa
    this.showPassword = !this.showPassword;
  }

  // Método que filtra la entrada del campo nombre en tiempo real
  // Se ejecuta en el evento input del campo nombre
  // Solo permite letras, espacios, guiones y apóstrofes (nombres válidos)
  filterNombre(event: any) {
    // Obtener referencia al elemento input del DOM
    const input = event.target;
    // Obtener el valor actual del input
    const value = input.value;
    // Aplicar expresión regular para filtrar caracteres no permitidos
    // /[^A-Za-zÀ-ÖØ-öø-ÿ\s']/g : regex que busca caracteres NO permitidos
    // [^ ] : conjunto negado (todo lo que NO esté en la lista)
    // A-Za-z : letras del alfabeto inglés (mayúsculas y minúsculas)
    // À-ÖØ-öø-ÿ : letras con acentos y diéresis (español, francés, etc.)
    // \s : espacios en blanco
    // ' : apóstrofe (para nombres como O'Connor)
    // g : flag global (reemplaza todas las ocurrencias)
    // replace() elimina todos los caracteres que coincidan con el patrón
    const filtrado = value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s']/g, '');
    // Actualizar el valor del input en el DOM con el texto filtrado
    input.value = filtrado;
    // Actualizar la propiedad del componente con el valor filtrado
    // Esto mantiene el modelo sincronizado
    this.nombre = filtrado;
  }

  // Método que filtra la entrada del campo apellido en tiempo real
  // Funciona exactamente igual que filterNombre
  // Solo permite letras, espacios, guiones y apóstrofes
  filterApellido(event: any) {
    // Obtener el elemento input del evento
    const input = event.target;
    // Obtener el valor actual
    const value = input.value;
    // Aplicar el mismo filtro que en nombre
    // Rechaza números, símbolos aritméticos y caracteres especiales
    const filtrado = value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s']/g, '');
    // Actualizar el valor visual del input
    input.value = filtrado;
    // Actualizar el modelo del componente
    this.apellido = filtrado;
  }

  // Método que maneja la entrada del campo correo
  // Intencionalmente NO filtra nada en tiempo real
  // Permite escribir cualquier carácter para mayor flexibilidad
  // La validación se realiza solo al hacer click en "Registrarse"
  filterCorreo(event: any) {
    // No hacer nada, permitir cualquier carácter
    // La validación se hará solo al hacer click en Registrarse
    // Esto da mejor UX permitiendo al usuario escribir libremente
  }

  // Método que filtra la entrada del campo contraseña en tiempo real
  // Solo permite letras (mayúsculas y minúsculas) y números
  filterPassword(event: any) {
    // Obtener referencia al input del DOM
    const input = event.target;
    // Obtener valor actual del input
    const value = input.value;
    // Aplicar filtro con regex
    // /[^A-Za-z0-9]/g : regex que busca caracteres NO alfanuméricos
    // [^ ] : conjunto negado
    // A-Za-z : letras mayúsculas y minúsculas
    // 0-9 : dígitos numéricos
    // g : flag global
    // replace() elimina símbolos, espacios, acentos, etc.
    const filtrado = value.replace(/[^A-Za-z0-9]/g, '');
    // Actualizar el valor visual en el input
    input.value = filtrado;
    // Actualizar el modelo del componente
    this.password = filtrado;
  }

  // Método asíncrono principal que maneja el proceso completo de registro
  // async: permite usar await para esperar promesas de forma síncrona
  async registrarse() {
    // Limpiar todos los mensajes de error previos antes de validar
    // Esto evita mostrar errores antiguos de intentos anteriores
    this.clearAllErrors();

    // Bandera para rastrear si hubo algún error de validación
    // Se usa para detener el envío si hay errores
    let hasError = false;

    // Definición de expresiones regulares (regex) para validaciones
    // Regex para nombres: permite letras (con acentos), espacios, guiones y apóstrofes
    // ^ : inicio del string
    // [A-Za-zÀ-ÖØ-öø-ÿ\s'-] : caracteres permitidos
    // + : uno o más caracteres
    // $ : fin del string
    const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/; // letras, espacios, guion y apóstrofe
    
    // Regex más restrictiva para correos electrónicos
    // ^[A-Za-z0-9._-]+ : parte local (antes del @) con letras, números, puntos, guiones
    // @ : arroba obligatoria
    // [A-Za-z0-9-]+ : dominio con letras, números y guiones
    // \\. : punto literal (escapado con \\)
    // [A-Za-z]{2,} : extensión del dominio (.com, .org, etc.) de al menos 2 letras
    // $ : fin del string
    const emailRegex = /^[A-Za-z0-9._-]+@[A-Za-z0-9-]+\.[A-Za-z]{2,}$/; // más restrictivo
    
    // Regex para contraseñas: solo letras (mayúsculas/minúsculas) y números
    // ^[A-Za-z0-9]+ : uno o más caracteres alfanuméricos
    // $ : fin del string
    const passwordAllowedRegex = /^[A-Za-z0-9]+$/; // solo letras y números

    // ===== VALIDACIÓN DEL NOMBRE =====
    // Validación 1: Verificar que el campo no esté vacío
    // ! operador NOT convierte valor a booleano e invierte
    // trim() elimina espacios en blanco al inicio y final
    if (!this.nombre || this.nombre.trim() === '') {
      // Asignar mensaje de error específico al campo nombre
      this.errorNombre = 'Por favor completa el nombre';
      // Marcar que hubo un error
      hasError = true;
    } 
    // Validación 2: Verificar longitud mínima (al menos 2 caracteres)
    else if (this.nombre.trim().length < 2) {
      this.errorNombre = 'El nombre debe tener al menos 2 caracteres';
      hasError = true;
    } 
    // Validación 3: Verificar formato con regex (solo letras y caracteres permitidos)
    // test() verifica si el string cumple con el patrón de la regex
    // ! NOT invierte el resultado
    else if (!nameRegex.test(this.nombre.trim())) {
      this.errorNombre = 'El nombre no debe contener números ni símbolos';
      hasError = true;
    }

    // ===== VALIDACIÓN DEL APELLIDO =====
    // Misma lógica que la validación del nombre
    if (!this.apellido || this.apellido.trim() === '') {
      this.errorApellido = 'Por favor completa el apellido';
      hasError = true;
    } else if (this.apellido.trim().length < 2) {
      this.errorApellido = 'El apellido debe tener al menos 2 caracteres';
      hasError = true;
    } else if (!nameRegex.test(this.apellido.trim())) {
      this.errorApellido = 'El apellido no debe contener números ni símbolos';
      hasError = true;
    }

    // ===== VALIDACIÓN DE LA EDAD =====
    // Validación 1: Verificar que se haya ingresado una edad
    // ! NOT convierte a booleano
    if (!this.edad) {
      this.errorEdad = 'Por favor completa la edad';
      hasError = true;
    } 
    // Validación 2: Verificar edad mínima (mayor de 18 años)
    // < operador menor que
    else if (this.edad < 18) {
      this.errorEdad = 'Debes ser mayor de 18 años para registrarte';
      hasError = true;
    } 
    // Validación 3: Verificar edad máxima razonable (120 años)
    // > operador mayor que
    else if (this.edad > 120) {
      this.errorEdad = 'Por favor ingresa una edad válida';
      hasError = true;
    }

    // ===== VALIDACIÓN DEL CORREO =====
    if (!this.correo || this.correo.trim() === '') {
      this.errorCorreo = 'Por favor completa el correo';
      hasError = true;
    } else {
      // Normalizar el correo: trim() elimina espacios, toLowerCase() convierte a minúsculas
      const correoTrimmed = this.correo.trim().toLowerCase();
      
      // IMPORTANTE: El registro público SOLO acepta @gmail.com
      // Los dominios @veterinario.com y @littlefalls.com son exclusivos para:
      // - Usuarios creados por el administrador
      // - Personal de la clínica (veterinarios y admins)
      // Verificar si el correo termina con @gmail.com
      // endsWith() verifica si el string termina con el patrón dado
      if (!correoTrimmed.endsWith('@gmail.com')) {
        this.errorCorreo = 'El correo debe terminar en @gmail.com';
        hasError = true;
      } 
      // Validar formato completo del correo con regex estricta
      // ^ : inicio del string
      // [A-Za-z0-9._\\-]+ : parte local (antes del @) con letras, números, puntos, guiones
      // @ : arroba obligatoria
      // gmail : dominio único permitido
      // \\.com$ : .com al final (\\. escapa el punto literal)
      else if (!/^[A-Za-z0-9._\-]+@gmail\.com$/.test(correoTrimmed)) {
        this.errorCorreo = 'Por favor ingresa un correo de Gmail válido';
        hasError = true;
      }
    }

    // ===== VALIDACIÓN DE LA CONTRASEÑA =====
    // Validación 1: Verificar que no esté vacía
    if (!this.password || this.password.trim() === '') {
      this.errorPassword = 'Por favor completa la contraseña';
      hasError = true;
    } 
    // Validación 2: Verificar longitud mínima (8 caracteres)
    // length: propiedad que retorna la cantidad de caracteres
    else if (this.password.length < 8) {
      this.errorPassword = 'La contraseña debe tener al menos 8 caracteres';
      hasError = true;
    } 
    // Validación 3: Verificar que solo contenga letras y números (sin símbolos)
    // test() verifica si cumple el patrón de la regex
    // ! NOT invierte el resultado
    else if (!passwordAllowedRegex.test(this.password)) {
      this.errorPassword = 'La contraseña solo puede contener letras y números';
      hasError = true;
    }

    // Si hubo algún error de validación, detener el proceso
    // return sale de la función sin ejecutar el código siguiente
    if (hasError) return;

    // Activar indicador de carga para mostrar spinner al usuario
    // Esto proporciona feedback visual de que se está procesando la petición
    this.cargando = true;

    // Bloque try-catch para manejar errores durante la petición HTTP
    try {
      // Llamar al método del servicio de autenticación para registrar el usuario
      // await: pausa la ejecución hasta que la promesa se resuelva
      // trim(): elimina espacios en blanco de los strings antes de enviar
      const resultado = await this.authService.registro(
        this.nombre.trim(),      // Nombre limpio sin espacios extra
        this.apellido.trim(),    // Apellido limpio
        this.edad,               // Edad como número
        this.correo.trim(),      // Correo limpio y normalizado
        this.password            // Contraseña (sin trim porque podría ser intencional)
      );

      // Desactivar indicador de carga ya que obtuvimos respuesta
      this.cargando = false;

      // Verificar si el registro fue exitoso según la respuesta del backend
      if (resultado.success) {
        // Verificar si el backend requiere verificación por correo
        if (resultado.requiereVerificacion) {
          // Mostrar mensaje informando al usuario sobre la verificación
          this.successMessage = resultado.mensaje;
          // Redirigir a la página de verificación de código
          // navigate(): cambia la ruta actual de la aplicación
          this.router.navigate(['/Verificar-Codigo'], {
            // queryParams: objeto con parámetros que se agregan a la URL
            // Ejemplo: /Verificar-Codigo?correo=usuario@gmail.com
            queryParams: { correo: this.correo.trim() }
          });
        } else {
          // Si no requiere verificación, registro completado directamente
          // Mostrar mensaje de éxito
          this.successMessage = '¡Registro exitoso! Ahora puedes iniciar sesión';
          // Navegar al login para que el usuario inicie sesión
          this.router.navigate(['/Login-LittleFalls']);
        }
      } else {
        // Si el backend retorna success: false (error en el registro)
        // Mostrar errores del backend si existen
        // resultado.errores puede ser un array de mensajes de error de validación
        if (resultado.errores && resultado.errores.length > 0) {
          // join(' \\n '): convierte array de strings en un solo string separado por saltos de línea
          // Esto permite mostrar múltiples errores en un solo mensaje
          this.errorGeneral = resultado.errores.join(' \n ');
        } else {
          // Si no hay array de errores, mostrar el mensaje general
          // || operador OR: usa 'Error al registrar' si resultado.mensaje no existe
          this.errorGeneral = resultado.mensaje || 'Error al registrar';
        }
      }
    } catch (error) {
      // Bloque catch captura errores de red (servidor caído, timeout, sin internet, etc.)
      // Estos son errores que ocurren antes de obtener respuesta del servidor
      // Desactivar indicador de carga
      this.cargando = false;
      // Mostrar mensaje genérico de error de conexión
      // Este error indica problemas de red, no de validación
      this.errorGeneral = 'Error de conexión con el servidor. Por favor intenta de nuevo.';
    }
  }

  // Método para limpiar el mensaje de error de un campo específico
  // Se llama cuando el usuario comienza a editar un campo (evento focus o input)
  // @param field - nombre del campo cuyo error se debe limpiar
  clearError(field: string) {
    // Usar condicionales para identificar qué campo limpiar
    // === operador de igualdad estricta (compara valor y tipo)
    if (field === 'nombre') this.errorNombre = '';
    if (field === 'apellido') this.errorApellido = '';
    if (field === 'edad') this.errorEdad = '';
    if (field === 'correo') this.errorCorreo = '';
    if (field === 'password') this.errorPassword = '';
    // Siempre limpiar errores generales cuando se edita cualquier campo
    // Esto mejora la UX eliminando mensajes antiguos
    this.errorGeneral = '';
    this.successMessage = '';
  }

  // Método para limpiar TODOS los mensajes de error de una vez
  // Se llama al inicio del método registrarse() antes de validar
  clearAllErrors() {
    // Asignar string vacío a cada variable de error
    // Esto resetea el estado de errores para una nueva validación
    this.errorNombre = '';
    this.errorApellido = '';
    this.errorEdad = '';
    this.errorCorreo = '';
    this.errorPassword = '';
    this.errorGeneral = '';
    this.successMessage = '';
  }
}
