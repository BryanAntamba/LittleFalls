import { Routes } from '@angular/router';
import { Inicio } from './components/inicio/inicio';
import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';
import { GestionUsuariosAdmin } from './components/gestion-usuarios-admin/gestion-usuarios-admin';
import { GestionCitasVeterinario } from './components/gestion-citas-veterinario/gestion-citas-veterinario';
import { HistorialMascotaVeterinario } from './components/historial-mascota-veterinario/historial-mascota-veterinario';
import { AgendarCita } from './components/agendar-cita/agendar-cita';
import { FormularioCita } from './components/formulario-cita/formulario-cita';
import { RecuperacionPasword } from './components/recuperacion-pasword/recuperacion-pasword';
import { RestablecerPasword } from './components/restablecer-pasword/restablecer-pasword';


export const routes: Routes = [
    { path: '', component: Inicio },
    {path: 'Login-LittleFalls', component: Login},
    {path: 'Registro-LittleFalls', component: Registro},
    {path: 'GestionUsuarios-Admin', component: GestionUsuariosAdmin},
    {path: 'GestionCitas-Veterinario', component: GestionCitasVeterinario},
    {path: 'historialMascota-Veterinario', component:HistorialMascotaVeterinario},
    {path: 'AgendamientoCita', component: AgendarCita},
    {path: 'FormularioCita', component: FormularioCita},
    {path: 'RecuperarPasword', component: RecuperacionPasword},
    {path: 'RestablecerPasword', component: RestablecerPasword}
];
