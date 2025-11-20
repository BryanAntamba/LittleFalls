import { Component } from '@angular/core';
import { BarraNavegacionVeterinario } from '../barra-navegacion-veterinario/barra-navegacion-veterinario';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  
  // Array que almacena todas las citas médicas
  // En producción, estos datos vendrían de una API/base de datos
  citas = [
    {
      nombre: 'Bryan',
      apellido: 'Justin',
      correo: 'bryan123@gmail.com',
      telefono: '0995336712',
      nombreMascota: 'Maxi',
      edadMascota: '3',
      generoMascota: 'Macho',
      tipoMascota: 'Gato',
      descripcion: 'Mi mascota es un gato angora de 3 años que esta teniendo problemas al caminar y nose que es y necesito su ayuda para que le revicen porfavor.'
    },
    {
      nombre: 'María',
      apellido: 'Gómez',
      correo: 'maria4000@gmail.com',
      telefono: '09178126643',
      nombreMascota: 'Kary',
      edadMascota: '5',
      generoMascota: 'Hembra',
      tipoMascota: 'Perro',
      descripcion: 'Buenas noches, necesito su ayuda ya que mi perrito de 5 añitos no quiere comer nada y solo pasa acostado y canzado, necesito que me ayuden con mi mascota, les agradeceria mucho.'
    }
  ];

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
    descripcion: ''
  };

  /**
   * Abre el modal de registro clínico
   */
  abrirModal() {
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
    console.log('Registro clínico guardado:', this.registroClinico);
    // TODO: Aquí irá la lógica para enviar los datos al backend
    // Ejemplo: this.http.post('/api/registros', this.registroClinico).subscribe(...)
    this.cerrarModal();
    alert('Registro clínico guardado exitosamente');
  }

  /**
   * Guarda los cambios de la cita editada
   * Actualiza el array de citas con los nuevos datos
   */
  guardarEdicion() {
    // Verificamos que tengamos un índice válido
    if (this.indiceEditando !== -1) {
      // Actualizamos la cita en el array con los datos editados
      this.citas[this.indiceEditando] = { ...this.citaEditar };
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
      // Eliminamos la cita del array
      this.citas.splice(indice, 1);
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
    console.log('Cita marcada como revisada:', this.citas[indice]);
    alert('Cita marcada como revisada');
    // TODO: Aquí puedes agregar lógica adicional:
    // - Cambiar un campo 'estado' de la cita
    // - Enviar notificación al dueño
    // - Actualizar en el backend
  }
}
