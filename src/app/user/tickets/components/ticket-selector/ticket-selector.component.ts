import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketService } from '../../../../admin/features/tickets/services/ticket.service';
import { SeatService } from '../../../../admin/features/tickets/services/seat.service';
import { UserCartService } from '../../services/user-cart.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TopBarComponent } from '../../../../shared/top-bar/top-bar.component';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-ticket-selector',
  templateUrl: './ticket-selector.component.html',
  styleUrls: ['./ticket-selector.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatToolbar,
    MatButton,
    MatProgressSpinnerModule,
    TopBarComponent,
    MatSnackBarModule,
    TranslateModule
  ],
})
export class TicketSelectorComponent implements OnInit {
  eventId!: number;
  userId!: number;
  seats: any[] = [];
  tickets: any[] = [];
  sectors: { name: string; rows: { rowNumber: number; seats: any[] }[] }[] = [];
  cartItems: any[] = [];
  totalPrice: number = 0;
  isLoading: boolean = true;

  constructor(
    private ticketService: TicketService,
    private seatService: SeatService,
    private userCartService: UserCartService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    const username = this.authService.getUsernameFromToken();
    if (username) {
      this.authService.getUserIdByUsername(username).subscribe(
        (id: number) => {
          this.authService.setUserId(id);
          this.userId = id;
          this.initializeComponent();
        },
        (error) => {
          console.error('Failed to fetch user ID:', error);
        }
      );
    } else {
      console.error('No username found in token');
    }
  }

  initializeComponent(): void {
    this.route.queryParams.subscribe(params => {
      this.isLoading = true;
      this.eventId = +params['eventId'] || 0;
      this.loadSeatsAndTickets(this.eventId).then(() => {
        this.loadUserCart();
        this.isLoading = false;
      });
    });
  }

  loadSeatsAndTickets(eventId: number): Promise<void> {
    this.isLoading = true;
    return new Promise((resolve) => {
      this.seatService.findByEventId(eventId).subscribe((seatsResponse: any[]) => {
        this.seats = seatsResponse.map((seat: any) => ({
          id: seat.id,
          seatNumber: seat.seatNumber,
          rowNumber: seat.row.rowNumber,
          sectorName: seat.row.sector.sectorName,
          status: 'OUT_OF_STOCK',
          price: null,
          ticketId: null,
        }));
  
        this.ticketService.getListOfAllTicketsByEventId(eventId).subscribe((ticketsResponse: any[]) => {
          this.tickets = ticketsResponse;
          this.tickets.forEach((ticket) => {
            const seat = this.seats.find((s) => s.id === ticket.seat.id);
            if (seat) {
              seat.status = ticket.status;
              seat.price = ticket.price;
              seat.ticketId = ticket.id;
            }
          });
  
          this.groupSeatsBySectorAndRow();
          resolve();
        });
      });
    });
  }  

  loadUserCart(): void {
    this.userCartService.getUserCart(this.userId).subscribe((cartResponse: any[]) => {
  
      this.cartItems = cartResponse.map((cartItem: any) => {
        const ticket = this.tickets.find(t => t.id === cartItem.ticketId);
        const seat = this.seats.find(s => s.id === ticket?.seat.id);
  
        if (seat && ticket) {
          seat.status = 'RESERVED';
          seat.price = ticket.price;
          seat.ticketId = ticket.id;
          return {
            ticketId: ticket.id,
            seatId: seat.id,
            price: ticket.price,
            sectorName: seat.sectorName,
            rowNumber: seat.rowNumber,
            seatNumber: seat.seatNumber,
            status: 'RESERVED',
          };
        } else {
          console.warn('Ticket or Seat not found for cart item:', cartItem);
          return null;
        }
      }).filter(item => item !== null);

      this.seats.forEach((seat) => {
        if (
          seat.status === 'RESERVED' && // Место помечено как зарезервированное
          !this.cartItems.some(item => item.seatId === seat.id) // Но его нет в cartItems 
                                                                // (значит, бронируется в данный момент другим пользователем, не текущим)
        ) {
          seat.status = 'OUT_OF_STOCK'; // Возвращаем статус вновь в OUT_OF_STOCK (нет в продаже) для текущего пользователя
        }
      });
  
      this.calculateTotalPrice(); 
    });
  }  

  toggleSeatSelection(seat: any): void {
    if (seat.status === 'AVAILABLE') {
      this.addToCart(seat);
    } else if (seat.status === 'RESERVED') {
      this.removeFromCart(seat);
    }
  }

  addToCart(seat: any): void {
    this.userCartService.addToCart(this.userId, seat.ticketId).subscribe({
      next: () => {
        this.cartItems.push({
          ticketId: seat.ticketId,
          seatId: seat.id,
          price: seat.price,
          sectorName: seat.sectorName,
          rowNumber: seat.rowNumber,
          seatNumber: seat.seatNumber,
          status: 'RESERVED',
        });
  
        seat.status = 'RESERVED';
        this.calculateTotalPrice();
      },
      error: (err) => {
        console.error('Error adding to cart:', err);
        if (err.status === 409) {
          this.translate.get('SEAT_RESERVATION_ERROR').subscribe((message) => {
            this.snackBar.open(message, this.translate.instant('CLOSE'), {
              duration: 3000,
              panelClass: 'snackbar-error',
            });
          });
        } else {
          this.translate.get('SEAT_CART_ERROR').subscribe((message) => {
            this.snackBar.open(message, this.translate.instant('CLOSE'), {
              duration: 3000,
              panelClass: 'snackbar-error',
            });
          });
        }
       }
      });
  }

  getSeatByCartItem(cartItem: any): any {
    return this.seats.find(seat => seat.id === cartItem.seatId);
  }  

  removeFromCart(seat: any): void {
    this.userCartService.removeFromCart(this.userId, seat.ticketId).subscribe(() => {
      this.cartItems = this.cartItems.filter((cartItem) => cartItem.ticketId !== seat.ticketId);
      seat.status = 'AVAILABLE';
      this.calculateTotalPrice();
    });
  }

  clearCart(): void {
    this.userCartService.clearCart(this.userId).subscribe(() => {
      this.cartItems.forEach((cartItem) => {
        const seat = this.seats.find((s) => s.ticketId === cartItem.ticketId);
        if (seat) {
          seat.status = 'AVAILABLE';
        }
      });

      this.cartItems = [];
      this.calculateTotalPrice();
    });
  }

  calculateTotalPrice(): void {
    this.totalPrice = this.cartItems.reduce((sum, ticket) => sum + ticket.price, 0);
  }

  groupSeatsBySectorAndRow(): void {
    const grouped = this.seats.reduce((acc: { name: string; rows: { rowNumber: number; seats: any[] }[] }[], seat: any) => {
      let sector = acc.find((s) => s.name === seat.sectorName);
      if (!sector) {
        sector = { name: seat.sectorName, rows: [] };
        acc.push(sector);
      }

      let row = sector.rows.find((r) => r.rowNumber === seat.rowNumber);
      if (!row) {
        row = { rowNumber: seat.rowNumber, seats: [] };
        sector.rows.push(row);
      }

      row.seats.push(seat);
      return acc;
    }, [] as { name: string; rows: { rowNumber: number; seats: any[] }[] }[]);

    grouped.forEach(sector => {
      sector.rows.sort((a, b) => a.rowNumber - b.rowNumber);
      sector.rows.forEach(row => {
        row.seats.sort((a, b) => a.seatNumber - b.seatNumber);
      });
    });
  
    grouped.sort((a, b) => a.name.localeCompare(b.name));
  
    this.sectors = grouped;
  }

  getSeatTooltip(seat: any): string {
    if (seat.status === 'OUT_OF_STOCK') {
      return `${this.translate.instant('SECTOR_LABEL')}: ${seat.sectorName}, ` +
             `${this.translate.instant('ROW_LABEL')}: ${seat.rowNumber}, ` +
             `${this.translate.instant('SEAT_LABEL')}: ${seat.seatNumber}, ` +
             `${this.translate.instant('STATUS_LABEL')}: ${this.translate.instant('STATUS_OUT_OF_STOCK')}`;
    }
    if (seat.status === 'SOLD') {
      return `${this.translate.instant('SECTOR_LABEL')}: ${seat.sectorName}, ` +
             `${this.translate.instant('ROW_LABEL')}: ${seat.rowNumber}, ` +
             `${this.translate.instant('SEAT_LABEL')}: ${seat.seatNumber}, ` +
             `${this.translate.instant('STATUS_LABEL')}: ${this.translate.instant('STATUS_SOLD')}`;
    }
    return `${this.translate.instant('SECTOR_LABEL')}: ${seat.sectorName}, ` +
           `${this.translate.instant('ROW_LABEL')}: ${seat.rowNumber}, ` +
           `${this.translate.instant('SEAT_LABEL')}: ${seat.seatNumber}` +
           (seat.price
             ? `, ${this.translate.instant('PRICE_LABEL')}: ${seat.price} BYN`
             : '');
  }  

  goBack(): void {
    this.router.navigate(['/view-available-events']);
  } 
  
  checkout(): void {
    this.router.navigate(['/purchase-commitment'], { queryParams: { eventId: this.eventId } });
  } 
}
