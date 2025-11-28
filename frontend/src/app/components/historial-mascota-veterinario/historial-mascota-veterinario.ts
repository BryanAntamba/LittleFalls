import { Component } from '@angular/core';
import { BarraNavegacionVeterinario } from '../barra-navegacion-veterinario/barra-navegacion-veterinario';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CitasService } from '../../services/citas.service';

@Component({
  selector: 'app-historial-mascota-veterinario',
  imports: [CommonModule, BarraNavegacionVeterinario, FormsModule],
  templateUrl: './historial-mascota-veterinario.html',
  styleUrl: './historial-mascota-veterinario.css',
})
export class HistorialMascotaVeterinario {
  
  // Obtener mascotas del servicio compartido
  get mascotas() {
    return this.citasService.getCitas();
  }

  // Control de modales
  mostrarModalHistorial = false;
  mostrarModalEditarRegistro = false;

  // Índices de control
  indiceMascotaSeleccionada = -1;
  mascotaSeleccionada: any = null;

  // Término de búsqueda
  terminoBusqueda = '';

  // Objeto para nuevo registro o edición
  registroClinico = {
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
    fotoCarnet: null as File | null,
    imagenesExamenes: [] as File[],
    observaciones: '',
    recomendaciones: ''
  };

  // Constructor para inyectar el servicio
  constructor(private citasService: CitasService) {}

  /**
   * Filtra mascotas por nombre
   */
  get mascotasFiltradas() {
    if (!this.terminoBusqueda) {
      return this.mascotas;
    }
    return this.mascotas.filter((m: any) => 
      m.nombreMascota.toLowerCase().includes(this.terminoBusqueda.toLowerCase())
    );
  }

  /**
   * Abre el modal para ver el historial clínico de la mascota
   */
  verHistorial(indiceMascota: number) {
    this.indiceMascotaSeleccionada = indiceMascota;
    this.mascotaSeleccionada = this.citasService.getCita(indiceMascota);
    this.mostrarModalHistorial = true;
  }

  /**
   * Cierra el modal de historial
   */
  cerrarModalHistorial() {
    this.mostrarModalHistorial = false;
    this.indiceMascotaSeleccionada = -1;
    this.mascotaSeleccionada = null;
  }

  /**
   * Abre el modal de edición desde el modal de historial
   */
  abrirEditar() {
    if (this.indiceMascotaSeleccionada !== -1) {
      // Cerrar el modal de historial
      this.mostrarModalHistorial = false;
      
      // Abrir el modal de edición
      this.editarRegistro(this.indiceMascotaSeleccionada);
    }
  }

  /**
   * Abre el modal para editar el registro clínico de la mascota
   */
  editarRegistro(indiceMascota: number) {
    this.indiceMascotaSeleccionada = indiceMascota;
    
    // Cargar datos del registro en el formulario
    const mascota = this.citasService.getCita(indiceMascota);
    if (mascota && mascota.registroClinico) {
      const registro = mascota.registroClinico;
      this.registroClinico = {
        fechaConsulta: registro.fechaConsulta || '',
        motivoConsulta: registro.motivoConsulta || '',
        sintomas: registro.sintomas || '',
        peso: registro.peso || '',
        temperatura: registro.temperatura || '',
        frecuenciaCardiaca: registro.frecuenciaCardiaca || '',
        frecuenciaRespiratoria: registro.frecuenciaRespiratoria || '',
        condicionCorporal: registro.condicionCorporal || '',
        diagnostico: registro.diagnostico || '',
        tratamiento: registro.tratamiento || '',
        procedimientos: registro.procedimientos || '',
        proximaCita: registro.proximaCita || '',
        tipoVacuna: registro.tipoVacuna || '',
        fechaVacuna: registro.fechaVacuna || '',
        proximaDosis: registro.proximaDosis || '',
        fotoCarnet: null,
        imagenesExamenes: [],
        observaciones: '',
        recomendaciones: ''
      };
    }
    
    this.mostrarModalEditarRegistro = true;
  }

  /**
   * Cierra el modal de edición
   */
  cerrarModalEditarRegistro() {
    this.mostrarModalEditarRegistro = false;
    this.indiceMascotaSeleccionada = -1;
    this.limpiarFormularioRegistro();
  }

  /**
   * Guarda los cambios del registro editado
   */
  guardarEdicionRegistro() {
    if (this.indiceMascotaSeleccionada !== -1) {
      this.citasService.actualizarRegistroClinico(
        this.indiceMascotaSeleccionada,
        this.registroClinico
      );
      
      console.log('Registro actualizado:', this.registroClinico);
      
      // Cerrar el modal de edición
      this.cerrarModalEditarRegistro();
      
      alert('Registro clínico actualizado exitosamente');
    }
  }

  /**
   * Maneja la selección de archivos
   */
  onFileSelect(event: any, tipo: 'carnet' | 'examenes') {
    if (tipo === 'carnet') {
      this.registroClinico.fotoCarnet = event.target.files[0];
    } else {
      this.registroClinico.imagenesExamenes = Array.from(event.target.files);
    }
  }

  /**
   * Limpia el formulario de registro
   */
  private limpiarFormularioRegistro() {
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
  }

  /**
   * Obtiene el nombre de la condición corporal
   */
  obtenerNombreCondicion(valor: string): string {
    const condiciones: { [key: string]: string } = {
      '1': 'Muy delgado',
      '2': 'Delgado',
      '3': 'Ideal',
      '4': 'Sobrepeso',
      '5': 'Obeso'
    };
    return condiciones[valor] || valor;
  }
}

