import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { BarraNavegacionAdmin } from '../barra-navegacion-admin/barra-navegacion-admin';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-gestion-usuarios-admin',
  imports: [CommonModule, BarraNavegacionAdmin, FormsModule],
  templateUrl: './gestion-usuarios-admin.html',
  styleUrl: './gestion-usuarios-admin.css',
})
export class GestionUsuariosAdmin implements OnInit {
  // ===== VARIABLES DE CONTROL DE MODALES =====
  mostrarModalIngresar = false;
  mostrarModalEditar = false;
  indiceEditando = -1;
  
  // ===== VARIABLES DE CONTROL DE VISIBILIDAD DE CONTRASEÑAS =====
  mostrarPassword = false;
  mostrarConfirmPassword = false;

  // ===== VARIABLES DE CARGA =====
  cargando = false;

  // ===== ARRAY DE DATOS =====
  veterinarios: any[] = [];

  // ===== OBJETO PARA NUEVO VETERINARIO =====
  nuevoVeterinario = {
    nombre: '',
    apellido: '',
    edad: '',
    correo: '',
    password: '',
    confirmPassword: '',
    tipoUsuario: 'veterinario'
  };

  // ===== OBJETO PARA EDITAR VETERINARIO =====
  veterinarioEditar = {
    _id: '',
    nombre: '',
    apellido: '',
    edad: '',
    correo: '',
    password: '',
    confirmPassword: ''
  };

  constructor(
    private usuariosService: UsuariosService,
    private alertService: AlertService,
    private cdr: ChangeDetectorRef
  ) {}

  /**
   * Inicialización del componente
   */
  ngOnInit() {
    this.cargarVeterinarios();
  }

  /**
   * Cargar todos los usuarios desde el backend
   */
  async cargarVeterinarios() {
    console.log('Componente: Iniciando carga de usuarios...');
    this.cargando = true;
    this.veterinarios = [];
    this.cdr.detectChanges();
    
    try {
      const resultado = await this.usuariosService.obtenerTodos();
      
      console.log('Componente: Resultado recibido:', resultado);
      
      if (resultado.success && resultado.usuarios) {
        this.veterinarios = resultado.usuarios;
        console.log('Componente: Usuarios cargados exitosamente:', this.veterinarios.length);
      } else {
        console.error('Componente: Error en resultado:', resultado);
        this.alertService.error(resultado.mensaje || 'Error al cargar usuarios');
      }
    } catch (error: any) {
      console.error('Componente: Exception capturada:', error);
      this.alertService.error('Error inesperado: ' + (error.message || 'Unknown error'));
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
      console.log('Componente: Carga finalizada. Total usuarios:', this.veterinarios.length);
    }
  }

  /**
   * Abre el modal para ingresar un nuevo veterinario
   */
  abrirModalIngresar() {
    this.nuevoVeterinario = {
      nombre: '',
      apellido: '',
      edad: '',
      correo: '',
      password: '',
      confirmPassword: '',
      tipoUsuario: 'veterinario'
    };
    this.mostrarPassword = false;
    this.mostrarConfirmPassword = false;
    this.mostrarModalIngresar = true;
  }

  /**
   * Cierra el modal de ingresar veterinario
   */
  cerrarModalIngresar() {
    this.mostrarModalIngresar = false;
  }

  /**
   * Abre el modal de edición
   */
  abrirModalEditar(veterinario: any, indice: number) {
    this.indiceEditando = indice;
    this.veterinarioEditar = {
      _id: veterinario._id,
      nombre: veterinario.nombre,
      apellido: veterinario.apellido,
      edad: veterinario.edad,
      correo: veterinario.correo,
      password: '',
      confirmPassword: ''
    };
    this.mostrarModalEditar = true;
  }

  /**
   * Cierra el modal de edición
   */
  cerrarModalEditar() {
    this.mostrarModalEditar = false;
    this.indiceEditando = -1;
  }

  /**
   * Guarda el nuevo veterinario
   */
  async guardarNuevoVeterinario() {
    // Validaciones básicas en frontend
    if (!this.nuevoVeterinario.nombre || !this.nuevoVeterinario.apellido || !this.nuevoVeterinario.correo) {
      this.alertService.error('Por favor complete los campos obligatorios: Nombre, Apellido y Correo');
      return;
    }

    if (!this.nuevoVeterinario.password || !this.nuevoVeterinario.confirmPassword) {
      this.alertService.error('Por favor ingrese la contraseña');
      return;
    }

    if (this.nuevoVeterinario.password !== this.nuevoVeterinario.confirmPassword) {
      this.alertService.error('Las contraseñas no coinciden');
      return;
    }

    this.cargando = true;
    try {
      const resultado = await this.usuariosService.crear({
        nombre: this.nuevoVeterinario.nombre.trim(),
        apellido: this.nuevoVeterinario.apellido.trim(),
        edad: parseInt(this.nuevoVeterinario.edad),
        correo: this.nuevoVeterinario.correo.trim(),
        password: this.nuevoVeterinario.password,
        tipoUsuario: this.nuevoVeterinario.tipoUsuario
      });

      if (resultado.success) {
        this.alertService.success('Veterinario creado exitosamente');
        this.cerrarModalIngresar();
        await this.cargarVeterinarios(); // Recargar la lista
      } else {
        // Mostrar errores del backend
        if (resultado.errores && resultado.errores.length > 0) {
          // Si hay múltiples errores, mostrarlos en lista
          const mensajeErrores = resultado.errores.join('\n• ');
          this.alertService.error('Errores de validación:\n• ' + mensajeErrores);
        } else {
          this.alertService.error(resultado.mensaje || 'Error al crear veterinario');
        }
      }
    } catch (error) {
      this.alertService.error('Error de conexión con el servidor');
    } finally {
      this.cargando = false;
    }
  }

  /**
   * Guarda los cambios del veterinario editado
   */
  async guardarEdicion() {
    if (this.indiceEditando === -1) return;

    // Validar contraseñas si se están modificando
    if (this.veterinarioEditar.password || this.veterinarioEditar.confirmPassword) {
      if (this.veterinarioEditar.password !== this.veterinarioEditar.confirmPassword) {
        this.alertService.error('Las contraseñas no coinciden');
        return;
      }
    }

    this.cargando = true;
    try {
      const datosActualizar: any = {
        nombre: this.veterinarioEditar.nombre.trim(),
        apellido: this.veterinarioEditar.apellido.trim(),
        edad: parseInt(this.veterinarioEditar.edad),
        correo: this.veterinarioEditar.correo.trim()
      };

      // Solo incluir password si se proporcionó uno nuevo
      if (this.veterinarioEditar.password) {
        datosActualizar.password = this.veterinarioEditar.password;
      }

      const resultado = await this.usuariosService.actualizar(
        this.veterinarioEditar._id,
        datosActualizar
      );

      if (resultado.success) {
        this.alertService.success('Veterinario actualizado exitosamente');
        this.cerrarModalEditar();
        await this.cargarVeterinarios(); // Recargar la lista
      } else {
        // Mostrar errores del backend
        if (resultado.errores && resultado.errores.length > 0) {
          const mensajeErrores = resultado.errores.join('\n• ');
          this.alertService.error('Errores de validación:\n• ' + mensajeErrores);
        } else {
          this.alertService.error(resultado.mensaje || 'Error al actualizar veterinario');
        }
      }
    } catch (error) {
      this.alertService.error('Error de conexión con el servidor');
    } finally {
      this.cargando = false;
    }
  }

  /**
   * Elimina un veterinario
   */
  async eliminarVeterinario(indice: number) {
    const veterinario = this.veterinarios[indice];
    
    if (!confirm(`¿Está seguro de eliminar a ${veterinario.nombre} ${veterinario.apellido}?`)) {
      return;
    }

    this.cargando = true;
    try {
      const resultado = await this.usuariosService.eliminar(veterinario._id);

      if (resultado.success) {
        this.alertService.success('Veterinario eliminado exitosamente');
        await this.cargarVeterinarios(); // Recargar la lista
      } else {
        this.alertService.error(resultado.mensaje || 'Error al eliminar veterinario');
      }
    } catch (error) {
      this.alertService.error('Error de conexión con el servidor');
    } finally {
      this.cargando = false;
    }
  }

  /**
   * Desactiva o activa un veterinario
   */
  async toggleDesactivar(indice: number) {
    const veterinario = this.veterinarios[indice];
    
    this.cargando = true;
    try {
      const resultado = await this.usuariosService.cambiarEstado(veterinario._id);

      if (resultado.success) {
        this.alertService.success(resultado.mensaje);
        await this.cargarVeterinarios(); // Recargar la lista
      } else {
        this.alertService.error(resultado.mensaje || 'Error al cambiar estado');
      }
    } catch (error) {
      this.alertService.error('Error de conexión con el servidor');
    } finally {
      this.cargando = false;
    }
  }
  /**
   * Alterna la visibilidad de la contraseña
   */
  togglePasswordVisibility() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  /**
   * Alterna la visibilidad de confirmar contraseña
   */
  toggleConfirmPasswordVisibility() {
    this.mostrarConfirmPassword = !this.mostrarConfirmPassword;
  }
}
