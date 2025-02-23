import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArenaFormComponent } from './arena-form.component';

describe('ArenaFormComponent', () => {
  let component: ArenaFormComponent;
  let fixture: ComponentFixture<ArenaFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArenaFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArenaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
