import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnightsComponent } from './knights.component';

describe('KnightsComponent', () => {
  let component: KnightsComponent;
  let fixture: ComponentFixture<KnightsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KnightsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KnightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
