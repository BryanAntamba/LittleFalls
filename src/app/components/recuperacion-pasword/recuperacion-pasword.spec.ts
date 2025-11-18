import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecuperacionPasword } from './recuperacion-pasword';

describe('RecuperacionPasword', () => {
  let component: RecuperacionPasword;
  let fixture: ComponentFixture<RecuperacionPasword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecuperacionPasword]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecuperacionPasword);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
