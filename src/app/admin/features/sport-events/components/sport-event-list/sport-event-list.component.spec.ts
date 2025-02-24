import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SportEventListComponent } from './sport-event-list.component';

describe('SportEventListComponent', () => {
  let component: SportEventListComponent;
  let fixture: ComponentFixture<SportEventListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SportEventListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SportEventListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
