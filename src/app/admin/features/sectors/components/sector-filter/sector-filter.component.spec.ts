import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectorFilterComponent } from './sector-filter.component';

describe('SectorFilterComponent', () => {
  let component: SectorFilterComponent;
  let fixture: ComponentFixture<SectorFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectorFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectorFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
