import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SportEventFormComponent } from './sport-event-form.component';

describe('SportEventFormComponent', () => {
  let component: SportEventFormComponent;
  let fixture: ComponentFixture<SportEventFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SportEventFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SportEventFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
