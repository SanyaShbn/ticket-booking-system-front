import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArenaSelectionComponent } from './arena-selection.component';

describe('ArenaSelectionComponent', () => {
  let component: ArenaSelectionComponent;
  let fixture: ComponentFixture<ArenaSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArenaSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArenaSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
