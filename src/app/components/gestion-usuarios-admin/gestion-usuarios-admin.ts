import { Component } from '@angular/core';
import { BarraNavegacionAdmin } from '../barra-navegacion-admin/barra-navegacion-admin';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Para usar [(ngModel)] en formularios

@Component({
  selector: 'app-gestion-usuarios-admin',
  imports: [CommonModule, BarraNavegacionAdmin, FormsModule],
  templateUrl: './gestion-usuarios-admin.html',
  styleUrl: './gestion-usuarios-admin.css',
})
export class GestionUsuariosAdmin {
  // ===== VARIABLES DE CONTROL DE MODALES =====
  mostrarModalIngresar = false; // Controla la visibilidad del modal de ingreso
  mostrarModalEditar = false; // Controla la visibilidad del modal de edición
  indiceEditando = -1; // Índice del veterinario siendo editado (-1 = ninguno)

  // ===== ARRAY DE DATOS =====
  // Array que almacena todos los veterinarios registrados
  // En producción, estos datos vendrían de una API/base de datos
  veterinarios = [
    {
      nombre: 'Bryan',
      apellido: 'Justin',
      edad: '22',
      correo: 'bryan@gmail.com',
      telefono: '0995336712',
      especialidad: 'Medicina General',
      cedula: '1234567890'
    },
    {
      nombre: 'María',
      apellido: 'Gómez',
      edad: '30',
      correo: 'maria@gmail.com',
      telefono: '0991234567',
      especialidad: 'Cirugía Veterinaria',
      cedula: '0987654321'
    }
  ];

  // ===== OBJETO PARA NUEVO VETERINARIO =====
  // Objeto temporal que almacena los datos del formulario de ingreso
  // Se resetea cada vez que se abre el modal
  nuevoVeterinario = {
    nombre: '',
    apellido: '',
    edad: '',
    correo: '',
    telefono: '',
    especialidad: '',
    cedula: ''
  };

  // ===== OBJETO PARA EDITAR VETERINARIO =====
  // Objeto temporal que almacena los datos mientras se edita
  // Se carga con los datos del veterinario seleccionado
  veterinarioEditar = {
    nombre: '',
    apellido: '',
    edad: '',
    correo: '',
    telefono: '',
    especialidad: '',
    cedula: ''
  };

  /**
   * Abre el modal para ingresar un nuevo veterinario
   * Resetea el formulario antes de mostrar el modal
   */
  abrirModalIngresar() {
    // Limpiamos todos los campos del formulario
    this.nuevoVeterinario = {
      nombre: '',
      apellido: '',
      edad: '',
      correo: '',
      telefono: '',
      especialidad: '',
      cedula: ''
    };
    // Mostramos el modal
    this.mostrarModalIngresar = true;
  }

  /**
   * Cierra el modal de ingresar veterinario
   */
  cerrarModalIngresar() {
    this.mostrarModalIngresar = false;
  }

  /**
   * Abre el modal de edición y carga los datos del veterinario seleccionado
   * @param veterinario - Objeto con los datos del veterinario a editar
   * @param indice - Posición del veterinario en el array
   */
  abrirModalEditar(veterinario: any, indice: number) {
    // Guardamos el índice para saber qué veterinario actualizar
    this.indiceEditando = indice;
    // Copiamos los datos del veterinario al objeto temporal
    // Usamos spread operator {...} para evitar referencias directas
    this.veterinarioEditar = { ...veterinario };
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
   * Guarda el nuevo veterinario en el array
   * Valida que los campos obligatorios estén completos
   */
  guardarNuevoVeterinario() {
    // Validación básica de campos requeridos
    if (!this.nuevoVeterinario.nombre || !this.nuevoVeterinario.apellido || !this.nuevoVeterinario.correo) {
      alert('Por favor complete los campos obligatorios: Nombre, Apellido y Correo');
      return; // Salimos si falta algún campo
    }

    // Agregamos el nuevo veterinario al array
    // Usamos spread operator para crear una copia
    this.veterinarios.push({ ...this.nuevoVeterinario });
    
    console.log('Nuevo veterinario agregado:', this.nuevoVeterinario);
    
    // TODO: Aquí irá la lógica para guardar en el backend
    // Ejemplo: this.http.post('/api/veterinarios', this.nuevoVeterinario).subscribe(...)
    
    this.cerrarModalIngresar(); // Cerramos el modal
    alert('Veterinario registrado exitosamente');
  }

  /**
   * Guarda los cambios del veterinario editado
   * Actualiza el array con los nuevos datos
   */
  guardarEdicion() {
    // Verificamos que tengamos un índice válido
    if (this.indiceEditando !== -1) {
      // Actualizamos el veterinario en el array con los datos editados
      this.veterinarios[this.indiceEditando] = { ...this.veterinarioEditar };
      
      console.log('Veterinario actualizado:', this.veterinarioEditar);
      
      // TODO: Aquí irá la lógica para actualizar en el backend
      // Ejemplo: this.http.put(`/api/veterinarios/${id}`, this.veterinarioEditar).subscribe(...)
      
      this.cerrarModalEditar(); // Cerramos el modal
      alert('Veterinario actualizado exitosamente');
    }
  }

  /**
   * Elimina un veterinario del array
   * Solicita confirmación antes de eliminar
   * @param indice - Posición del veterinario a eliminar
   */
  eliminarVeterinario(indice: number) {
    // Mostramos un diálogo de confirmación
    if (confirm('¿Está seguro de eliminar este veterinario?')) {
      // Eliminamos el veterinario del array usando splice
      this.veterinarios.splice(indice, 1);
      alert('Veterinario eliminado exitosamente');
      
      // TODO: Aquí irá la lógica para eliminar en el backend
      // Ejemplo: this.http.delete(`/api/veterinarios/${id}`).subscribe(...)
    }
  }

  /**
   * Desactiva o activa un veterinario
   * Función preparada para implementar lógica de activación/desactivación
   * @param indice - Posición del veterinario
   */
  toggleDesactivar(indice: number) {
    console.log('Veterinario desactivado/activado:', this.veterinarios[indice]);
    alert('Estado del veterinario actualizado');
    
    // TODO: Implementar lógica de activación/desactivación
    // Podrías agregar un campo 'activo: boolean' al objeto veterinario
    // y cambiar su estado aquí
    // Ejemplo: this.veterinarios[indice].activo = !this.veterinarios[indice].activo;
  }
}
