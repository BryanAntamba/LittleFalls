import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarraNavegacionVeterinario } from './barra-navegacion-veterinario';

describe('BarraNavegacionVeterinario', () => {
  let component: BarraNavegacionVeterinario;
  let fixture: ComponentFixture<BarraNavegacionVeterinario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarraNavegacionVeterinario]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BarraNavegacionVeterinario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
