import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { BarraNavegacionVeterinario } from '../barra-navegacion-veterinario/barra-navegacion-veterinario';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CitasService } from '../../services/citas.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-historial-mascota-veterinario',
  imports: [CommonModule, BarraNavegacionVeterinario, FormsModule],
  templateUrl: './historial-mascota-veterinario.html',
  styleUrl: './historial-mascota-veterinario.css',
})
export class HistorialMascotaVeterinario implements OnInit {
  
  // Array local de citas del historial
  private citasHistorial: any[] = [];

  // Obtener mascotas del historial local
  get mascotas() {
    return this.citasHistorial;
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
  fechaMinima = '';

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
    private cdr: ChangeDetectorRef,
    private alertService: AlertService
  ) {
    // Establecer fecha mínima como hoy
    const hoy = new Date();
    this.fechaMinima = hoy.toISOString().split('T')[0];
  }

  async ngOnInit() {
    console.log('Historial - Cargando citas revisadas...');
    
    try {
      // Obtener el ID del veterinario del localStorage
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
      const veterinarioId = usuario._id || usuario.id;
      
      if (!veterinarioId) {
        console.error('No se encontró el ID del veterinario');
        this.citasHistorial = [];
        return;
      }

      // Cargar solo las citas revisadas (historial)
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/api/citas/veterinario/${veterinarioId}/historial`, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      const resultado = await response.json();
      
      if (resultado.success) {
        this.citasHistorial = resultado.citas || [];
        console.log('Historial - Citas revisadas cargadas:', this.citasHistorial.length);
      } else {
        console.error('Error al cargar historial:', resultado);
        this.citasHistorial = [];
      }
    } catch (error) {
      console.error('Error al cargar historial:', error);
      this.citasHistorial = [];
    }
    
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
    this.mascotaSeleccionada = this.citasHistorial[indiceMascota];
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
    const mascota = this.citasHistorial[indiceMascota];
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
        const cita = this.citasHistorial[this.indiceMascotaSeleccionada];
        
        console.log('Actualizando registro para cita:', cita._id);
        console.log('Datos a enviar:', this.registroClinico);
        console.log('Índice del registro:', this.indiceRegistroEditando);
        
        // Agregar el índice del registro al objeto
        const datosActualizacion = {
          ...this.registroClinico,
          indiceRegistro: this.indiceRegistroEditando
        };
        
        // Enviar al backend
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`http://localhost:3000/api/citas/${cita._id}/registro-clinico`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
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
          
          // Actualizar la cita localmente con los datos del backend
          if (resultado.cita) {
            this.citasHistorial[indiceTemp] = resultado.cita;
          }
          
          // Actualizar la mascota seleccionada con los datos frescos del backend
          this.mascotaSeleccionada = this.citasHistorial[indiceTemp];
          
          // Mantener el modal de historial abierto
          this.mostrarModalHistorial = true;
          
          // Forzar detección de cambios
          this.cdr.detectChanges();
          
          // Mostrar mensaje después
          setTimeout(() => {
            this.alertService.success('Registro clínico actualizado exitosamente');
          }, 200);
        } else {
          this.alertService.error('Error al actualizar registro: ' + (resultado.mensaje || 'Error desconocido'));
        }
      } catch (error) {
        console.error('Error al actualizar registro clínico:', error);
        this.alertService.error('Error de conexión con el servidor');
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
   * Valida que la fecha seleccionada no sea una fecha pasada
   */
  validarFechaDomingo(event: any, campo: string) {
    const fechaSeleccionada = new Date(event.target.value + 'T00:00:00');
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    // Verificar si es una fecha pasada
    if (fechaSeleccionada < hoy) {
      this.alertService.error('No se pueden seleccionar fechas pasadas. Por favor seleccione una fecha actual o futura.');
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
}

