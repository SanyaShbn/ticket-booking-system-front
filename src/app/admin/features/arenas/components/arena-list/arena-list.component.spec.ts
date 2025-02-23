import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArenaListComponent } from './arena-list.component';

describe('ArenaListComponent', () => {
  let component: ArenaListComponent;
  let fixture: ComponentFixture<ArenaListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArenaListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArenaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
