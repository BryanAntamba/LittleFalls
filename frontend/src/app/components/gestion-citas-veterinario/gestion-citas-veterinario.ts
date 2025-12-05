import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { BarraNavegacionVeterinario } from '../barra-navegacion-veterinario/barra-navegacion-veterinario';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CitasService } from '../../services/citas.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-gestion-citas-veterinario',
  imports: [CommonModule, BarraNavegacionVeterinario, FormsModule],
  templateUrl: './gestion-citas-veterinario.html',
  styleUrl: './gestion-citas-veterinario.css',
})
export class GestionCitasVeterinario implements OnInit {
  // Variables para controlar la visibilidad de los modales
  mostrarModal = false; // Modal del registro clínico
  mostrarModalEditar = false; // Modal de edición de cita
  indiceEditando = -1; // Índice de la cita que se está editando (-1 = ninguna)
  
  // Array de citas cargadas
  citas: any[] = [];

  // Objeto que almacena todos los datos del registro clínico veterinario
  registroClinico = {
    // Información básica de la consulta
    fechaConsulta: '',
    motivoConsulta: '',
    sintomas: '',
    
    // Datos del examen físico
    peso: '',
    temperatura: '',
    frecuenciaCardiaca: '',
    frecuenciaRespiratoria: '',
    condicionCorporal: '', // Escala del 1 al 5
    
    // Diagnóstico y tratamiento
    diagnostico: '',
    tratamiento: '',
    procedimientos: '',
    proximaCita: '',
    
    // Información de vacunación
    tipoVacuna: '',
    fechaVacuna: '',
    proximaDosis: '',
    
    // Archivos adjuntos
    fotoCarnet: null as File | null, // Foto del carnet de vacunación
    imagenesExamenes: [] as File[], // Array de imágenes (radiografías, análisis, etc.)
    
    // Observaciones adicionales
    observaciones: '',
    recomendaciones: ''
  };

  // Objeto temporal que almacena los datos de la cita mientras se edita
  citaEditar: any = {
    _id: '',
    nombrePaciente: '',
    apellidoPaciente: '',
    correoPaciente: '',
    telefonoPaciente: '',
    nombreMascota: '',
    edadMascota: 0,
    sexoMascota: '',
    tipoMascota: '',
    descripcion: ''
  };

  // Variable para indicar a qué cita pertenece el registro clínico que se está creando
  indiceCitaActual = -1;
  cargando = false;
  fechaMinima = '';

  // Constructor para inyectar el servicio de citas
  constructor(
    private citasService: CitasService,
    private cdr: ChangeDetectorRef,
    private alertService: AlertService
  ) {
    // Establecer fecha mínima como hoy
    const hoy = new Date();
    this.fechaMinima = hoy.toISOString().split('T')[0];
  }

  async ngOnInit() {
    await this.cargarCitas();
  }

  async cargarCitas() {
    this.cargando = true;
    this.cdr.detectChanges();
    
    try {
      // Obtener el ID del veterinario del localStorage
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
      const veterinarioId = usuario._id || usuario.id;
      
      if (!veterinarioId) {
        console.error('No se encontró el ID del veterinario');
        this.citas = [];
        return;
      }

      // Cargar solo las citas activas (no revisadas)
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/citas/veterinario/${veterinarioId}/activas`, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      const resultado = await response.json();
      
      if (resultado.success) {
        this.citas = resultado.citas || [];
        console.log('Citas activas cargadas:', this.citas.length);
      } else {
        console.error('Error al cargar citas:', resultado);
        this.citas = [];
      }
    } catch (error) {
      console.error('Error al cargar citas:', error);
      this.citas = [];
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * Abre el modal de registro clínico
   * @param indiceCita - Índice de la cita a la que se le agregará el registro clínico
   */
  abrirModal(indiceCita: number) {
    this.indiceCitaActual = indiceCita;
    this.mostrarModal = true;
  }

  /**
   * Cierra el modal de registro clínico
   */
  cerrarModal() {
    this.mostrarModal = false;
  }

  /**
   * Abre el modal de edición y carga los datos de la cita seleccionada
   * @param cita - Objeto con los datos de la cita a editar
   * @param indice - Posición de la cita en el array
   */
  abrirModalEditar(cita: any, indice: number) {
    // Guardamos el índice para saber qué cita actualizar después
    this.indiceEditando = indice;
    // Copiamos los datos de la cita al objeto temporal
    this.citaEditar = {
      _id: cita._id || '',
      nombrePaciente: cita.nombrePaciente || '',
      apellidoPaciente: cita.apellidoPaciente || '',
      correoPaciente: cita.correoPaciente || '',
      telefonoPaciente: cita.telefonoPaciente || '',
      nombreMascota: cita.nombreMascota || '',
      edadMascota: cita.edadMascota || 0,
      sexoMascota: cita.sexoMascota || '',
      tipoMascota: cita.tipoMascota || '',
      descripcion: cita.descripcion || ''
    };
    console.log('Datos cargados en modal:', this.citaEditar);
    // Mostramos el modal
    this.mostrarModalEditar = true;
  }

  /**
   * Cierra el modal de edición y resetea el índice
   */
  cerrarModalEditar() {
    this.mostrarModalEditar = false;
    this.indiceEditando = -1; // Reseteamos el índice
  }

  /**
   * Maneja la selección de archivos (imágenes)
   * @param event - Evento del input file
   * @param tipo - Tipo de archivo: 'carnet' o 'examenes'
   */
  onFileSelect(event: any, tipo: 'carnet' | 'examenes') {
    if (tipo === 'carnet') {
      // Solo un archivo para el carnet
      this.registroClinico.fotoCarnet = event.target.files[0];
    } else {
      // Múltiples archivos para exámenes médicos
      this.registroClinico.imagenesExamenes = Array.from(event.target.files);
    }
  }

  /**
   * Guarda el registro clínico
   * En producción, aquí se haría una petición POST a la API
   */
  async guardarRegistro() {
    if (this.indiceCitaActual !== -1) {
      // Validar que los campos de texto contengan al menos una letra
      const camposTexto = [
        { valor: this.registroClinico.motivoConsulta, nombre: 'Motivo de consulta' },
        { valor: this.registroClinico.sintomas, nombre: 'Síntomas' },
        { valor: this.registroClinico.diagnostico, nombre: 'Diagnóstico' },
        { valor: this.registroClinico.tratamiento, nombre: 'Tratamiento' },
        { valor: this.registroClinico.procedimientos, nombre: 'Procedimientos' },
        { valor: this.registroClinico.tipoVacuna, nombre: 'Tipo de vacuna' }
      ];

      for (const campo of camposTexto) {
        if (campo.valor && campo.valor.trim() !== '') {
          // Verificar que contenga al menos una letra
          if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(campo.valor)) {
            this.alertService.error(`El campo "${campo.nombre}" debe contener al menos una letra`);
            return;
          }
        }
      }

      try {
        const cita = this.citas[this.indiceCitaActual];
        
        console.log('Guardando registro para cita:', cita._id);
        console.log('Datos del registro:', this.registroClinico);
        
        // Enviar al backend
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`http://localhost:3000/api/citas/${cita._id}/registro-clinico`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify(this.registroClinico)
        });

        const resultado = await response.json();
        console.log('Respuesta del servidor:', resultado);

        if (resultado.success || response.ok) {
          // Actualizar localmente
          this.citasService.agregarRegistroClinico(
            this.indiceCitaActual, 
            this.registroClinico
          );
          
          // Actualizar la cita en el array local con los datos del backend
          this.citas[this.indiceCitaActual] = resultado.cita;
          // Asegurarse de que tieneRegistroClinico esté marcado
          this.citas[this.indiceCitaActual].tieneRegistroClinico = true;
          console.log('Cita actualizada localmente:', this.citas[this.indiceCitaActual]);
          console.log('Registros en la cita:', this.citas[this.indiceCitaActual].registrosClinicosHistorial);
          
          // Limpiar el formulario
          this.registroClinico = {
            fechaConsulta: '',
            motivoConsulta: '',
            sintomas: '',
            peso: '',
            temperatura: '',
            frecuenciaCardiaca: '',
            frecuenciaRespiratoria: '',
            condicionCorporal: '',
            diagnostico: '',
            tratamiento: '',
            procedimientos: '',
            proximaCita: '',
            tipoVacuna: '',
            fechaVacuna: '',
            proximaDosis: '',
            fotoCarnet: null,
            imagenesExamenes: [],
            observaciones: '',
            recomendaciones: ''
          };
          
          // Cerrar modal primero
          this.cerrarModal();
          
          // Forzar detección de cambios
          this.cdr.detectChanges();
          
          // Mostrar mensaje después con un pequeño delay
          setTimeout(() => {
            this.alertService.success('Registro clínico guardado exitosamente');
          }, 100);
        } else {
          this.alertService.error('Error al guardar registro clínico: ' + (resultado.mensaje || 'Error desconocido'));
        }
      } catch (error) {
        console.error('Error al guardar registro clínico:', error);
        this.alertService.error('Error de conexión con el servidor');
      }
    }
  }

  /**
   * Guarda los cambios de la cita editada
   * Actualiza el array de citas con los nuevos datos
   */
  async guardarEdicion() {
    // Verificamos que tengamos un índice válido
    if (this.indiceEditando !== -1 && this.citaEditar._id) {
      try {
        // Actualizar en el backend
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`http://localhost:3000/api/citas/${this.citaEditar._id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify(this.citaEditar)
        });

        const resultado = await response.json();

        if (resultado.success || response.ok) {
          // Actualizar en el array local
          this.citas[this.indiceEditando] = { ...this.citas[this.indiceEditando], ...this.citaEditar };
          
          // Cerrar modal primero
          this.cerrarModalEditar();
          
          // Forzar detección de cambios
          this.cdr.detectChanges();
          
          // Mostrar mensaje después
          setTimeout(() => {
            this.alertService.success('Cita actualizada exitosamente');
          }, 100);
        } else {
          this.alertService.error('Error al actualizar la cita: ' + (resultado.mensaje || 'Error desconocido'));
        }
      } catch (error) {
        console.error('Error al actualizar cita:', error);
        this.alertService.error('Error de conexión con el servidor');
      }
    }
  }

  /**
   * Elimina una cita del array
   * @param indice - Posición de la cita a eliminar
   */
  async eliminarCita(indice: number) {
    // Confirmación antes de eliminar
    const confirmado = await this.alertService.confirm(
      'Esta acción no se puede deshacer.',
      '¿Está seguro de eliminar esta cita?'
    );
    
    if (confirmado) {
      // Eliminamos usando el servicio
      this.citasService.eliminarCitaLocal(indice);
      this.citas = this.citasService.getCitas();
      this.alertService.success('Cita eliminada exitosamente');
      // TODO: Aquí irá la lógica para eliminar en el backend
      // Ejemplo: this.http.delete(`/api/citas/${id}`).subscribe(...)
    }
  }

  /**
   * Marca una cita como revisada y la mueve al historial
   * @param indice - Posición de la cita
   */
  async marcarRevisado(indice: number) {
    const cita = this.citas[indice];
    
    // Validar que tenga registro clínico
    if (!cita.tieneRegistroClinico) {
      this.alertService.error('Debe guardar el registro clínico antes de marcar como revisada');
      return;
    }

    // Confirmar acción con alerta personalizada
    const confirmado = await this.alertService.confirm(
      'La cita se moverá al historial y no aparecerá más en la lista de citas pendientes.',
      '¿Marcar esta cita como revisada?'
    );
    
    if (!confirmado) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/citas/${cita._id}/revisada`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      const resultado = await response.json();

      if (resultado.success || response.ok) {
        // Eliminar la cita del array actual (ya que se mueve al historial)
        this.citas.splice(indice, 1);
        this.cdr.detectChanges();
        
        this.alertService.success('Cita marcada como revisada y movida al historial');
      } else {
        this.alertService.error(resultado.mensaje || 'Error al marcar cita como revisada');
      }
    } catch (error) {
      console.error('Error al marcar cita como revisada:', error);
      this.alertService.error('Error de conexión con el servidor');
    }
  }

  /**
   * Valida que solo se puedan ingresar números y el punto decimal
   * @param event - Evento del teclado
   */
  validarNumero(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    // Permite números (48-57), punto decimal (46), y teclas especiales (8=backspace, 9=tab, etc.)
    if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode !== 46) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  /**
   * Filtra caracteres especiales permitiendo solo letras, números, espacios, acentos, comas y puntos
   * @param event - Evento del input
   */
  filtrarTexto(event: any) {
    const input = event.target;
    const value = input.value;
    // Permite letras, números, espacios, puntos, comas y acentos (sin guiones ni paréntesis)
    const filtrado = value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,]/g, '');
    input.value = filtrado;
    // Actualizar el modelo según el campo
    const name = event.target.name;
    if (name.includes('motivoConsulta')) this.registroClinico.motivoConsulta = filtrado;
    else if (name.includes('sintomas')) this.registroClinico.sintomas = filtrado;
    else if (name.includes('diagnostico')) this.registroClinico.diagnostico = filtrado;
    else if (name.includes('tratamiento')) this.registroClinico.tratamiento = filtrado;
    else if (name.includes('procedimientos')) this.registroClinico.procedimientos = filtrado;
    else if (name.includes('tipoVacuna')) this.registroClinico.tipoVacuna = filtrado;
  }

  /**
   * Filtra para permitir solo letras en campos de nombre
   * @param event - Evento del input
   */
  filtrarSoloLetras(event: any) {
    const input = event.target;
    const value = input.value;
    // Solo letras, espacios y acentos
    const filtrado = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    input.value = filtrado;
    // Actualizar modelo
    const name = event.target.name;
    if (name === 'nombrePaciente') this.citaEditar.nombrePaciente = filtrado;
    else if (name === 'apellidoPaciente') this.citaEditar.apellidoPaciente = filtrado;
    else if (name === 'nombreMascota') this.citaEditar.nombreMascota = filtrado;
  }

  /**
   * Filtra para permitir solo números en teléfono
   * @param event - Evento del input
   */
  filtrarSoloNumeros(event: any) {
    const input = event.target;
    const value = input.value;
    const filtrado = value.replace(/[^0-9]/g, '');
    input.value = filtrado;
    if (event.target.name === 'telefonoPaciente') {
      this.citaEditar.telefonoPaciente = filtrado;
    }
  }

  /**
   * Valida que la fecha seleccionada no sea una fecha pasada
   */
  validarFecha(event: any) {
    const fechaSeleccionada = new Date(event.target.value + 'T00:00:00');
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    // Verificar si es una fecha pasada
    if (fechaSeleccionada < hoy) {
      this.alertService.error('No se pueden seleccionar fechas pasadas. Por favor seleccione una fecha actual o futura.');
      event.target.value = '';
      // Limpiar el campo correspondiente del modelo
      const fieldName = event.target.name;
      if (fieldName === 'fechaConsulta') {
        this.registroClinico.fechaConsulta = '';
      } else if (fieldName === 'proximaCita') {
        this.registroClinico.proximaCita = '';
      } else if (fieldName === 'fechaVacuna') {
        this.registroClinico.fechaVacuna = '';
      } else if (fieldName === 'proximaDosis') {
        this.registroClinico.proximaDosis = '';
      }
    }
  }
}
