import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { PaginatorComponent } from '../../../../../shared/paginator/paginator.component';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FilterConfig, FilterComponent } from '../../../../../shared/filter/filter.component'; 
import { Ticket } from '../../models/ticket.model';
import { TicketService } from '../../services/ticket.service';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.component.html',
  styleUrl: './ticket-list.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    FilterComponent,
    PaginatorComponent,
    ReactiveFormsModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    NgIf,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    TranslateModule
  ]
})
export class TicketListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['price', 'status', 'seat', 'actions'];
  dataSource = new MatTableDataSource<Ticket>();
  page: number = 0;
  size: number = 10;
  totalElements: number = 0;
  eventId!: number;
  seatId!: number;
  isLoading: boolean = true;

  @ViewChild(MatSort) sort!: MatSort;

  filters = {
    priceSortOrder: ''
  };

  filterConfig: FilterConfig[] = [];
  private langChangeSubscription!: Subscription;

  constructor(
    private ticketService: TicketService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private translate: TranslateService 
  ) {}

  ngOnInit(): void {
    this.updateFilterConfig();
    
    this.langChangeSubscription = this.translate.onLangChange.subscribe(() => {
      this.updateFilterConfig();
    });

    this.route.queryParams.subscribe(params => {
      this.eventId = +params['eventId'] || 0;
      this.loadTickets();
    });
  }

  ngOnDestroy(): void {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }

  updateFilterConfig(): void {
    this.filterConfig = [
      { label: this.translate.instant('FILTER_PRICE_SORT'), formControlName: 'priceSortOrder', type: 'select', options: [
        { value: '', viewValue: this.translate.instant('FILTER_SORTING') },
        { value: 'ASC', viewValue: this.translate.instant('FILTER_ASCENDING') },
        { value: 'DESC', viewValue: this.translate.instant('FILTER_DESCENDING') }
      ]}
    ];
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => {
      this.page = 0;
      this.loadTickets();
    });
  }

  loadTickets(): void {
    this.isLoading = true;
    this.ticketService.getTickets(
      this.eventId,
      this.filters.priceSortOrder,
      this.page,
      this.size
    ).subscribe(data => {
      this.dataSource.data = data.content.map((ticket: any) => ({
      ...ticket,
      seatInfo: ticket.seat 
        ? `${this.translate.instant('SECTOR_LABEL')} ${ticket.seat.row.sector.sectorName}, ` +
          `${this.translate.instant('ROW_LABEL')} ${ticket.seat.row.rowNumber}, ` +
          `${this.translate.instant('SEAT_LABEL')} №${ticket.seat.seatNumber}`
        : this.translate.instant('UNKNOWN_SEAT')
      }));
      this.totalElements = data.metadata.totalElements;
      this.isLoading = false;
    });
  }

  onFilterChanged(filters: any): void {
    this.filters = filters;
    this.page = 0;
    this.loadTickets();
  }

  addTicket(): void {
    this.router.navigate(['/admin/tickets/list/new'], { queryParams: { eventId: this.eventId } });
  }

  editTicket(ticket: Ticket): void {
    this.router.navigate(['/admin/tickets/list/edit', ticket.id], { queryParams: { eventId: this.eventId } });
  }

  deleteTicket(id: number): void {
    this.ticketService.deleteTicket(id).subscribe(
      () => {
        this.translate.get('TICKET_DELETE_SUCCESS').subscribe((message) => {
          this.snackBar.open(message, this.translate.instant('CLOSE'), {
            duration: 3000
          });
        });
        this.loadTickets();
      },
      (error) => {
        this.translate.get('TICKET_DELETE_FAILURE').subscribe((message) => {
          this.snackBar.open(message, this.translate.instant('CLOSE'), {
            duration: 3000,
            panelClass: 'snackbar-error',
          });
        });
        console.error('Error deleting ticket:', error);
      }
    );
  }

  goBack(): void {
    this.router.navigate(['/admin/tickets']);
  }  

  onPageChange(newPage: number): void {
    this.page = newPage;
    this.loadTickets();
  }

  onSizeChange(newSize: number): void {
    this.size = newSize;
    this.page = 0;
    this.loadTickets();
  }
}
