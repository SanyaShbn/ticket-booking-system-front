import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArenaFilterComponent } from './arena-filter.component';

describe('ArenaFilterComponent', () => {
  let component: ArenaFilterComponent;
  let fixture: ComponentFixture<ArenaFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArenaFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArenaFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
