import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
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
export class HistorialMascotaVeterinario implements OnInit {
  
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
  indiceRegistroEditando = -1; // Para saber qué registro se está editando

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
  constructor(
    private citasService: CitasService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    console.log('Historial - Cargando citas...');
    await this.citasService.cargarCitas();
    console.log('Historial - Citas cargadas:', this.citasService.getCitas());
    
    // Forzar detección de cambios para que Angular actualice la vista
    this.cdr.detectChanges();
  }

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
   * Obtiene los registros clínicos ordenados (más reciente primero)
   */
  obtenerRegistrosOrdenados() {
    if (!this.mascotaSeleccionada?.registrosClinicosHistorial) {
      return [];
    }
    // Crear una copia del array y ordenar por fecha descendente (más reciente primero)
    return [...this.mascotaSeleccionada.registrosClinicosHistorial].reverse();
  }

  /**
   * Abre el modal para ver el historial clínico de la mascota
   */
  verHistorial(indiceMascota: number) {
    this.indiceMascotaSeleccionada = indiceMascota;
    this.mascotaSeleccionada = this.citasService.getCita(indiceMascota);
    console.log('Mascota seleccionada:', this.mascotaSeleccionada);
    console.log('Registros clínicos:', this.mascotaSeleccionada?.registrosClinicosHistorial);
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
    // Por defecto edita el último registro (más reciente)
    this.abrirEditarRegistro(0);
  }

  /**
   * Abre el modal para editar un registro específico
   */
  abrirEditarRegistro(indiceRegistro: number) {
    if (this.indiceMascotaSeleccionada !== -1) {
      // Cerrar el modal de historial
      this.mostrarModalHistorial = false;
      
      // Guardar el índice del registro que se está editando
      this.indiceRegistroEditando = this.mascotaSeleccionada.registrosClinicosHistorial.length - 1 - indiceRegistro;
      
      // Abrir el modal de edición con los datos del registro
      this.editarRegistro(this.indiceMascotaSeleccionada, this.indiceRegistroEditando);
    }
  }

  /**
   * Abre el modal para editar el registro clínico de la mascota
   */
  editarRegistro(indiceMascota: number, indiceRegistro?: number) {
    this.indiceMascotaSeleccionada = indiceMascota;
    
    // Cargar datos del registro en el formulario
    const mascota = this.citasService.getCita(indiceMascota);
    if (mascota && mascota.registrosClinicosHistorial && mascota.registrosClinicosHistorial.length > 0) {
      // Si no se especifica índice, editar el último registro
      const idx = indiceRegistro !== undefined ? indiceRegistro : mascota.registrosClinicosHistorial.length - 1;
      this.indiceRegistroEditando = idx;
      
      const registro = mascota.registrosClinicosHistorial[idx];
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
    this.indiceRegistroEditando = -1;
    this.limpiarFormularioRegistro();
  }

  /**
   * Guarda los cambios del registro editado
   */
  async guardarEdicionRegistro() {
    if (this.indiceMascotaSeleccionada !== -1) {
      try {
        const cita = this.citasService.getCita(this.indiceMascotaSeleccionada);
        
        console.log('Actualizando registro para cita:', cita._id);
        console.log('Datos a enviar:', this.registroClinico);
        console.log('Índice del registro:', this.indiceRegistroEditando);
        
        // Agregar el índice del registro al objeto
        const datosActualizacion = {
          ...this.registroClinico,
          indiceRegistro: this.indiceRegistroEditando
        };
        
        // Enviar al backend
        const response = await fetch(`http://localhost:3000/api/citas/${cita._id}/registro-clinico`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datosActualizacion)
        });

        const resultado = await response.json();
        console.log('Respuesta del servidor:', resultado);

        if (resultado.success || response.ok) {
          // Guardar el índice antes de cerrar
          const indiceTemp = this.indiceMascotaSeleccionada;
          
          // Cerrar SOLO el modal de edición
          this.mostrarModalEditarRegistro = false;
          this.indiceRegistroEditando = -1;
          this.limpiarFormularioRegistro();
          
          // Recargar todas las citas desde el backend
          await this.citasService.cargarCitas();
          
          // Actualizar la mascota seleccionada con los datos frescos del backend
          this.indiceMascotaSeleccionada = indiceTemp;
          this.mascotaSeleccionada = this.citasService.getCita(indiceTemp);
          
          // Mantener el modal de historial abierto
          this.mostrarModalHistorial = true;
          
          // Forzar detección de cambios
          this.cdr.detectChanges();
          
          // Mostrar mensaje después
          setTimeout(() => {
            alert('Registro clínico actualizado exitosamente');
          }, 200);
        } else {
          alert('Error al actualizar registro: ' + (resultado.mensaje || 'Error desconocido'));
        }
      } catch (error) {
        console.error('Error al actualizar registro clínico:', error);
        alert('Error de conexión con el servidor');
      }
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

  /**
   * Valida que la fecha seleccionada no sea domingo
   */
  validarFechaDomingo(event: any, campo: string) {
    const fecha = new Date(event.target.value + 'T00:00:00');
    if (fecha.getDay() === 0) { // 0 = Domingo
      alert('No se permiten citas los domingos. Por favor seleccione otro día.');
      // Limpiar el campo
      if (campo === 'fechaConsulta') {
        this.registroClinico.fechaConsulta = '';
      } else if (campo === 'proximaCita') {
        this.registroClinico.proximaCita = '';
      } else if (campo === 'fechaVacuna') {
        this.registroClinico.fechaVacuna = '';
      } else if (campo === 'proximaDosis') {
        this.registroClinico.proximaDosis = '';
      }
      event.target.value = '';
    }
  }
}

