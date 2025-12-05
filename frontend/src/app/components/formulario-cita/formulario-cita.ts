import { Component } from '@angular/core';
import { BarraNavegacion } from '../barra-navegacion/barra-navegacion';
import { PiePagina } from '../pie-pagina/pie-pagina';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CitasService } from '../../services/citas.service';
import { AlertService } from '../../services/alert.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-formulario-cita',
  standalone: true,
  imports: [BarraNavegacion, PiePagina, RouterModule, CommonModule, FormsModule],
  templateUrl: './formulario-cita.html',
  styleUrl: './formulario-cita.css',
})
export class FormularioCita {
  cargando = false;
  
  cita = {
    nombrePaciente: '',
    apellidoPaciente: '',
    correoPaciente: '',
    telefonoPaciente: '',
    nombreMascota: '',
    edadMascota: 0,
    tipoMascota: 'Perro',
    sexoMascota: 'Macho',
    fecha: '',
    hora: '',
    descripcion: ''
  };

  constructor(
    private citasService: CitasService,
    private alertService: AlertService,
    private authService: AuthService,
    private router: Router
  ) {
    const fechaCita = localStorage.getItem('fechaCita');
    const horaCita = localStorage.getItem('horaCita');
    
    if (fechaCita) this.cita.fecha = fechaCita;
    if (horaCita) this.cita.hora = horaCita;
  }

  /**
   * Filtra para permitir solo letras en campos de nombre
   */
  filtrarSoloLetras(event: any, campo: string) {
    const input = event.target;
    const value = input.value;
    const filtrado = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    input.value = filtrado;
    
    if (campo === 'nombre') this.cita.nombrePaciente = filtrado;
    else if (campo === 'apellido') this.cita.apellidoPaciente = filtrado;
    else if (campo === 'nombreMascota') this.cita.nombreMascota = filtrado;
  }

  /**
   * Filtra para permitir solo números en teléfono (máximo 10)
   */
  filtrarTelefono(event: any) {
    const input = event.target;
    const value = input.value;
    const filtrado = value.replace(/[^0-9]/g, '').substring(0, 10);
    input.value = filtrado;
    this.cita.telefonoPaciente = filtrado;
  }

  /**
   * Filtra descripción permitiendo letras, números, espacios, comas y puntos
   */
  filtrarDescripcion(event: any) {
    const input = event.target;
    const value = input.value;
    const filtrado = value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,]/g, '');
    input.value = filtrado;
    this.cita.descripcion = filtrado;
  }

  async agendarCita() {
    if (!this.validarFormulario()) {
      return;
    }

    this.cargando = true;

    try {
      const usuario = this.authService.getUsuario();
      
      // Convertir hora de formato 12h a 24h
      const hora24 = this.convertirHora12a24(this.cita.hora);
      
      // Combinar fecha y hora para crear un objeto Date válido
      const fechaHora = new Date(`${this.cita.fecha}T${hora24}`);
      
      const datos = {
        pacienteId: usuario ? usuario._id : null,
        nombrePaciente: this.cita.nombrePaciente,
        apellidoPaciente: this.cita.apellidoPaciente,
        correoPaciente: this.cita.correoPaciente,
        telefonoPaciente: this.cita.telefonoPaciente,
        nombreMascota: this.cita.nombreMascota,
        edadMascota: Number(this.cita.edadMascota),
        tipoMascota: this.cita.tipoMascota,
        sexoMascota: this.cita.sexoMascota,
        fecha: fechaHora.toISOString(),
        hora: this.cita.hora,
        descripcion: this.cita.descripcion
      };

      console.log('Datos a enviar:', datos);

      const resultado = await this.citasService.crearCita(datos);

      console.log('Resultado del servidor:', resultado);

      if (resultado.success) {
        this.alertService.success('Cita agendada exitosamente');
        localStorage.removeItem('fechaCita');
        localStorage.removeItem('horaCita');
        this.router.navigate(['/']);
      } else {
        this.alertService.error(resultado.mensaje || 'Error al agendar cita');
      }
    } catch (error) {
      console.error('Error completo:', error);
      this.alertService.error('Error de conexión con el servidor');
    } finally {
      this.cargando = false;
    }
  }

  convertirHora12a24(hora12: string): string {
    const [tiempo, periodo] = hora12.split(' ');
    let [horas, minutos] = tiempo.split(':');
    
    let horasNum = parseInt(horas);
    
    if (periodo === 'PM' && horasNum !== 12) {
      horasNum += 12;
    } else if (periodo === 'AM' && horasNum === 12) {
      horasNum = 0;
    }
    
    return `${horasNum.toString().padStart(2, '0')}:${minutos || '00'}:00`;
  }

  validarFormulario(): boolean {
    // Validar nombre - solo letras
    if (!this.cita.nombrePaciente || this.cita.nombrePaciente.trim() === '') {
      this.alertService.error('Por favor ingrese su nombre');
      return false;
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(this.cita.nombrePaciente)) {
      this.alertService.error('El nombre solo puede contener letras');
      return false;
    }

    // Validar apellido - solo letras
    if (!this.cita.apellidoPaciente || this.cita.apellidoPaciente.trim() === '') {
      this.alertService.error('Por favor ingrese su apellido');
      return false;
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(this.cita.apellidoPaciente)) {
      this.alertService.error('El apellido solo puede contener letras');
      return false;
    }

    // Validar correo - solo @gmail.com o @hotmail.com
    if (!this.cita.correoPaciente || this.cita.correoPaciente.trim() === '') {
      this.alertService.error('Por favor ingrese su correo electrónico');
      return false;
    }
    const correoLower = this.cita.correoPaciente.toLowerCase();
    if (!correoLower.endsWith('@gmail.com') && !correoLower.endsWith('@hotmail.com')) {
      this.alertService.error('El correo debe terminar en @gmail.com o @hotmail.com');
      return false;
    }
    if (!/^[A-Za-z0-9._\-]+@(gmail|hotmail)\.com$/.test(correoLower)) {
      this.alertService.error('Formato de correo inválido');
      return false;
    }

    // Validar teléfono - exactamente 10 dígitos
    if (!this.cita.telefonoPaciente || this.cita.telefonoPaciente.trim() === '') {
      this.alertService.error('Por favor ingrese su teléfono');
      return false;
    }
    if (!/^\d{10}$/.test(this.cita.telefonoPaciente)) {
      this.alertService.error('El teléfono debe tener exactamente 10 dígitos');
      return false;
    }

    // Validar nombre mascota - solo letras
    if (!this.cita.nombreMascota || this.cita.nombreMascota.trim() === '') {
      this.alertService.error('Por favor ingrese el nombre de su mascota');
      return false;
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(this.cita.nombreMascota)) {
      this.alertService.error('El nombre de la mascota solo puede contener letras');
      return false;
    }

    // Validar edad mascota - máximo 20 años
    if (!this.cita.edadMascota || this.cita.edadMascota <= 0) {
      this.alertService.error('Por favor ingrese una edad válida para su mascota');
      return false;
    }
    if (this.cita.edadMascota > 20) {
      this.alertService.error('La edad de la mascota no puede superar los 20 años');
      return false;
    }

    // Validar descripción - debe contener al menos una letra
    if (!this.cita.descripcion || this.cita.descripcion.trim() === '') {
      this.alertService.error('Por favor describa el motivo de la cita');
      return false;
    }
    if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(this.cita.descripcion)) {
      this.alertService.error('La descripción debe contener al menos una letra');
      return false;
    }

    if (!this.cita.fecha || !this.cita.hora) {
      this.alertService.error('Por favor seleccione fecha y hora');
      return false;
    }

    return true;
  }
}
