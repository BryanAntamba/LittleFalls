import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarraNavegacionAdmin } from './barra-navegacion-admin';

describe('BarraNavegacionAdmin', () => {
  let component: BarraNavegacionAdmin;
  let fixture: ComponentFixture<BarraNavegacionAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarraNavegacionAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BarraNavegacionAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
