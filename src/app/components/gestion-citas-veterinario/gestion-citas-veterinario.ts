import { Component } from '@angular/core';
import { BarraNavegacionVeterinario } from '../barra-navegacion-veterinario/barra-navegacion-veterinario';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CitasService } from '../../services/citas.service';

@Component({
  selector: 'app-gestion-citas-veterinario',
  imports: [CommonModule, BarraNavegacionVeterinario, FormsModule],
  templateUrl: './gestion-citas-veterinario.html',
  styleUrl: './gestion-citas-veterinario.css',
})
export class GestionCitasVeterinario {
  // Variables para controlar la visibilidad de los modales
  mostrarModal = false; // Modal del registro clínico
  mostrarModalEditar = false; // Modal de edición de cita
  indiceEditando = -1; // Índice de la cita que se está editando (-1 = ninguna)
  
  // Obtener las citas del servicio compartido
  get citas() {
    return this.citasService.getCitas();
  }

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
  citaEditar = {
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    nombreMascota: '',
    edadMascota: '',
    generoMascota: '',
    tipoMascota: '',
    descripcion: '',
    registrosClinicosHistorial: [] as any[]
  };

  // Variable para indicar a qué cita pertenece el registro clínico que se está creando
  indiceCitaActual = -1;

  // Constructor para inyectar el servicio de citas
  constructor(private citasService: CitasService) {}

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
    // Copiamos los datos de la cita al objeto temporal (spread operator para evitar referencia)
    this.citaEditar = { ...cita };
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
  guardarRegistro() {
    if (this.indiceCitaActual !== -1) {
      // Usar el servicio para agregar el registro clínico
      const nuevoRegistro = this.citasService.agregarRegistroClinico(
        this.indiceCitaActual, 
        this.registroClinico
      );
      
      console.log('Registro clínico guardado:', nuevoRegistro);
      console.log('Cita actualizada:', this.citasService.getCita(this.indiceCitaActual));
      
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
      
      this.cerrarModal();
      alert('Registro clínico guardado exitosamente');
    }
  }

  /**
   * Guarda los cambios de la cita editada
   * Actualiza el array de citas con los nuevos datos
   */
  guardarEdicion() {
    // Verificamos que tengamos un índice válido
    if (this.indiceEditando !== -1) {
      // Actualizamos la cita usando el servicio
      this.citasService.actualizarCita(this.indiceEditando, { ...this.citaEditar });
      console.log('Cita actualizada:', this.citaEditar);
      // TODO: Aquí irá la lógica para actualizar en el backend
      // Ejemplo: this.http.put(`/api/citas/${id}`, this.citaEditar).subscribe(...)
      this.cerrarModalEditar();
      alert('Cita actualizada exitosamente');
    }
  }

  /**
   * Elimina una cita del array
   * @param indice - Posición de la cita a eliminar
   */
  eliminarCita(indice: number) {
    // Confirmación antes de eliminar
    if (confirm('¿Está seguro de eliminar esta cita?')) {
      // Eliminamos usando el servicio
      this.citasService.eliminarCita(indice);
      alert('Cita eliminada exitosamente');
      // TODO: Aquí irá la lógica para eliminar en el backend
      // Ejemplo: this.http.delete(`/api/citas/${id}`).subscribe(...)
    }
  }

  /**
   * Marca una cita como revisada
   * @param indice - Posición de la cita
   */
  marcarRevisado(indice: number) {
    console.log('Cita marcada como revisada:', this.citasService.getCita(indice));
    alert('Cita marcada como revisada');
    // TODO: Aquí puedes agregar lógica adicional:
    // - Cambiar un campo 'estado' de la cita
    // - Enviar notificación al dueño
    // - Actualizar en el backend
  }
}
