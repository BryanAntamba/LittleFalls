import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialMascotaVeterinario } from './historial-mascota-veterinario';

describe('HistorialMascotaVeterinario', () => {
  let component: HistorialMascotaVeterinario;
  let fixture: ComponentFixture<HistorialMascotaVeterinario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialMascotaVeterinario]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialMascotaVeterinario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
