import { Routes } from '@angular/router';
import { Inicio } from './components/inicio/inicio';
import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';
import { VerificarCodigo } from './components/verificar-codigo/verificar-codigo';
import { GestionUsuariosAdmin } from './components/gestion-usuarios-admin/gestion-usuarios-admin';
import { GestionCitasVeterinario } from './components/gestion-citas-veterinario/gestion-citas-veterinario';
import { HistorialMascotaVeterinario } from './components/historial-mascota-veterinario/historial-mascota-veterinario';
import { AgendarCita } from './components/agendar-cita/agendar-cita';
import { FormularioCita } from './components/formulario-cita/formulario-cita';
import { RecuperacionPasword } from './components/recuperacion-pasword/recuperacion-pasword';
import { RestablecerPasword } from './components/restablecer-pasword/restablecer-pasword';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';


export const routes: Routes = [
    { path: '', component: Inicio },
    { path: 'Login-LittleFalls', component: Login },
    { path: 'Registro-LittleFalls', component: Registro },
    { path: 'Verificar-Codigo', component: VerificarCodigo },
    { path: 'RecuperarPasword', component: RecuperacionPasword },
    { path: 'RestablecerPasword', component: RestablecerPasword },
    { path: 'GestionUsuarios-Admin', component: GestionUsuariosAdmin, canActivate: [authGuard, roleGuard], data: { roles: ['admin'] } },
    { path: 'GestionCitas-Veterinario', component: GestionCitasVeterinario, canActivate: [authGuard, roleGuard], data: { roles: ['veterinario'] } },
    { path: 'historialMascota-Veterinario', component: HistorialMascotaVeterinario, canActivate: [authGuard, roleGuard], data: { roles: ['veterinario'] } },
    { path: 'AgendamientoCita', component: AgendarCita, canActivate: [authGuard, roleGuard], data: { roles: ['paciente'] } },
    { path: 'FormularioCita', component: FormularioCita, canActivate: [authGuard, roleGuard], data: { roles: ['paciente'] } }
];
