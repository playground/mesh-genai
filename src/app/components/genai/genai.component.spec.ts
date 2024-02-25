import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenaiComponent } from './genai.component';

describe('GenaiComponent', () => {
  let component: GenaiComponent;
  let fixture: ComponentFixture<GenaiComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GenaiComponent]
    });
    fixture = TestBed.createComponent(GenaiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
