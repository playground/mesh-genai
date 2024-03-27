import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LangchainJsComponent } from './langchain-js.component';

describe('LangchainJsComponent', () => {
  let component: LangchainJsComponent;
  let fixture: ComponentFixture<LangchainJsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LangchainJsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LangchainJsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
