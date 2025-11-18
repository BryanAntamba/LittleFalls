import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionUsuariosAdmin } from './gestion-usuarios-admin';

describe('GestionUsuariosAdmin', () => {
  let component: GestionUsuariosAdmin;
  let fixture: ComponentFixture<GestionUsuariosAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionUsuariosAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionUsuariosAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
