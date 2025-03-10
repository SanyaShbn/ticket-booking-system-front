import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchasedTicketsComponent } from './purchased-tickets.component';

describe('PurchasedTicketsComponent', () => {
  let component: PurchasedTicketsComponent;
  let fixture: ComponentFixture<PurchasedTicketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchasedTicketsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchasedTicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
