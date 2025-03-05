import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SportEventSelectionComponent } from './sport-event-selection.component';

describe('SportEventSelectionComponent', () => {
  let component: SportEventSelectionComponent;
  let fixture: ComponentFixture<SportEventSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SportEventSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SportEventSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
