import { Component } from '@angular/core';
import { BarraNavegacionAdmin } from '../barra-navegacion-admin/barra-navegacion-admin';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gestion-usuarios-admin',
  imports: [CommonModule, BarraNavegacionAdmin],
  templateUrl: './gestion-usuarios-admin.html',
  styleUrl: './gestion-usuarios-admin.css',
})
export class GestionUsuariosAdmin {

}
