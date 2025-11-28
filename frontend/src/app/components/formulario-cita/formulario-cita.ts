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
    if (!this.cita.nombrePaciente || !this.cita.apellidoPaciente) {
      this.alertService.error('Por favor ingrese su nombre y apellido');
      return false;
    }

    if (!this.cita.correoPaciente) {
      this.alertService.error('Por favor ingrese su correo electrónico');
      return false;
    }

    if (!this.cita.telefonoPaciente) {
      this.alertService.error('Por favor ingrese su teléfono');
      return false;
    }

    if (!this.cita.nombreMascota) {
      this.alertService.error('Por favor ingrese el nombre de su mascota');
      return false;
    }

    if (!this.cita.edadMascota || this.cita.edadMascota <= 0) {
      this.alertService.error('Por favor ingrese una edad válida para su mascota');
      return false;
    }

    if (!this.cita.descripcion) {
      this.alertService.error('Por favor describa el motivo de la cita');
      return false;
    }

    if (!this.cita.fecha || !this.cita.hora) {
      this.alertService.error('Por favor seleccione fecha y hora');
      return false;
    }

    return true;
  }
}
