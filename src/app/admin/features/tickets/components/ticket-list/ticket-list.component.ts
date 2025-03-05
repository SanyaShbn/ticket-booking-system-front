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
    MatProgressSpinnerModule
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

  filterConfig: FilterConfig[] = [
    { label: 'Price Sort Order', formControlName: 'priceSortOrder', type: 'select', options: [
      { value: '', viewValue: '-- Sorting --' },
      { value: 'ASC', viewValue: 'Ascending' },
      { value: 'DESC', viewValue: 'Descending' }
    ]}
  ];

  constructor(private ticketService: TicketService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.eventId = +params['eventId'] || 0;
      this.loadTickets();
    });
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
      seatInfo: ticket.seat ? `Sector: ${ticket.seat.row.sector.sectorName}, Row: ${ticket.seat.row.rowNumber}, Seat №${ticket.seat.seatNumber}` : 'Unknown'
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
    this.ticketService.deleteTicket(id).subscribe(() => {
      this.loadTickets();
    });
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
