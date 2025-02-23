import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RowFormComponent } from './row-form.component';

describe('RowFormComponent', () => {
  let component: RowFormComponent;
  let fixture: ComponentFixture<RowFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RowFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RowFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
