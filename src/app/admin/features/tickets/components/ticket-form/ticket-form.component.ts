import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { TicketService } from '../../services/ticket.service';
import { Ticket } from '../../models/ticket.model';
import { Seat } from '../../models/seat.model';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { startWith, map, switchMap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SeatService } from '../../services/seat.service';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-ticket-form',
  templateUrl: './ticket-form.component.html',
  styleUrl: './ticket-form.component.scss',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule,
    MatCardModule,
    MatAutocompleteModule,
    MatSnackBarModule,
    TranslateModule
  ]
})
export class TicketFormComponent implements OnInit {
  ticketForm!: FormGroup;
  isEditMode = false;
  ticketId!: number;
  eventId!: number;
  seatId!: number;
  seats$: Observable<any[]> | undefined;
  selectedSeat: Seat | null = null;
  page: number = 0;
  totalPages: number = 0;

  constructor(
    private fb: FormBuilder,
    private ticketService: TicketService,
    private seatService: SeatService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private translate: TranslateService 
  ) {}

  ngOnInit(): void {
    this.ticketForm = this.fb.group({
      price: ['', Validators.required],
      seat: ['', Validators.required]
    });

    this.route.queryParams.subscribe(params => {
      this.eventId = +params['eventId'] || 0;
    });

    this.route.params.subscribe(params => {
      this.ticketId = +params['id'] || 0;
      this.isEditMode = !!this.ticketId;
      if (this.isEditMode) {
        this.loadTicket();
      }
    });

    const seatControl = this.ticketForm.get('seat');
     if (seatControl) {
      this.seats$ = seatControl.valueChanges.pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(() => 
           this.isEditMode
            ? this.seatService.findAvailableSeatsWhenUpdatingExistingTicket(this.eventId, this.seatId, this.page, 5).pipe(
              map(response => {
                this.totalPages = response.totalPages;
                return response.content;
              })
              )
             : this.seatService.findAvailableSeatsWhenAddingNewTicket(this.eventId, this.page, 5).pipe(
                map(response => {
                  this.totalPages = response.totalPages;
                  return response.content;
              })
            )
        )
      );
    }
  }

  loadTicket(): void {
    this.ticketService.getTicketById(this.ticketId).subscribe(ticket => {
      this.ticketForm.patchValue(ticket);
      this.seatId = this.isEditMode ? this.ticketForm.value.seat.id : ticket.seatId;
    });
  }

  onSubmit(): void {
    if (this.ticketForm.invalid) {
      return;
    }

    const ticket: Ticket = {
      ...this.ticketForm.value,
      eventId: this.eventId,
      seatId: this.selectedSeat?.id || 0,
    };

    if (this.isEditMode) {
      this.ticketService.updateTicket(this.eventId, this.seatId, this.ticketId, ticket).subscribe({
        next: () => {
          this.translate.get('TICKET_UPDATE_SUCCESS').subscribe((message) => {
            this.snackBar.open(message, this.translate.instant('CLOSE'), {
              duration: 3000
            });
          });
          this.router.navigate(['/admin/tickets/list'], { queryParams: { eventId: this.eventId } });
        },
        error: (err) => {
          const errorMessage = err?.error?.message || this.translate.instant('TICKET_UPDATE_FAILURE');
          this.snackBar.open(errorMessage, this.translate.instant('CLOSE'), {
            duration: 3000,
            panelClass: 'snackbar-error',
          });
        },
      });
    } else {
      this.ticketService.createTicket(this.eventId, this.seatId, ticket).subscribe({
        next: () => {
          this.translate.get('TICKET_CREATE_SUCCESS').subscribe((message) => {
            this.snackBar.open(message, this.translate.instant('CLOSE'), {
              duration: 3000
            });
          });
          this.router.navigate(['/admin/tickets/list'], { queryParams: { eventId: this.eventId } });
        },
        error: (err) => {
          const errorMessage = err?.error?.message || this.translate.instant('TICKET_CREATE_FAILURE');
          this.snackBar.open(errorMessage, this.translate.instant('CLOSE'), {
            duration: 3000,
            panelClass: 'snackbar-error',
          });
        },
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/tickets/list'], { queryParams: { eventId: this.eventId } });
  }
  
  
  displaySeatFn = (seat: any): string => {
    if (!seat) {
      return '';
    }
  
    const sectorLabel = this.translate.instant('SECTOR_LABEL');
    const rowLabel = this.translate.instant('ROW_LABEL');
    const seatLabel = this.translate.instant('SEAT_LABEL');
  
    return `${sectorLabel} ${seat.row.sector.sectorName}, ` +
           `${rowLabel} ${seat.row.rowNumber}, ` +
           `${seatLabel} №${seat.seatNumber}`;
  };   
 
  onSeatSelected(selectedSeat: Seat): void {
    this.selectedSeat = selectedSeat;
    this.seatId = selectedSeat.id;
  }
  
  onPageChange(newPage: number): void {
      if (newPage >= 0 && newPage < this.totalPages) {
        this.page = newPage;
  
        if (this.isEditMode) {
          this.seats$ = this.seatService.findAvailableSeatsWhenUpdatingExistingTicket(this.eventId, this.seatId, this.page, 5).pipe(
            map(response => {
              this.totalPages = response.totalPages;
              return response.content;
            })
          );
        } else {
          this.seats$ = this.seatService.findAvailableSeatsWhenAddingNewTicket(this.eventId, this.page, 5).pipe(
            map(response => {
              this.totalPages = response.totalPages;
              return response.content;
            })
          );
        }        
  
        const seatControl = this.ticketForm.get('seat');
        if (seatControl) {
          seatControl.setValue(seatControl.value);
        }
      }
    }  
}
