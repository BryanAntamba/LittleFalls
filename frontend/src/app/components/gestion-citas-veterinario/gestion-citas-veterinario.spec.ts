import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionCitasVeterinario } from './gestion-citas-veterinario';

describe('GestionCitasVeterinario', () => {
  let component: GestionCitasVeterinario;
  let fixture: ComponentFixture<GestionCitasVeterinario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionCitasVeterinario]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionCitasVeterinario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
