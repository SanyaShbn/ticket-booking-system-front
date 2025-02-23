import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectorSelectionComponent } from './sector-selection.component';

describe('SectorSelectionComponent', () => {
  let component: SectorSelectionComponent;
  let fixture: ComponentFixture<SectorSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectorSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectorSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
