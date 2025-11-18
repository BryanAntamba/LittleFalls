import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestablecerPasword } from './restablecer-pasword';

describe('RestablecerPasword', () => {
  let component: RestablecerPasword;
  let fixture: ComponentFixture<RestablecerPasword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestablecerPasword]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestablecerPasword);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
