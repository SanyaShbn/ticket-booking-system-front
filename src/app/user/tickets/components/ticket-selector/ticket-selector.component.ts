import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketService } from '../../../../admin/features/tickets/services/ticket.service';
import { SeatService } from '../../../../admin/features/tickets/services/seat.service';
import { UserCartService } from '../../services/user-cart.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-ticket-selector',
  templateUrl: './ticket-selector.component.html',
  styleUrls: ['./ticket-selector.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatToolbar,
    MatButton,
    MatProgressSpinnerModule
  ],
})
export class TicketSelectorComponent implements OnInit {
  eventId!: number;
  seats: any[] = [];
  tickets: any[] = [];
  sectors: { name: string; rows: { rowNumber: number; seats: any[] }[] }[] = [];
  cartItems: any[] = [];
  totalPrice: number = 0;
  userId: number = 43; // Пример ID пользователя (будет запрашиваться после аутентификации, сейчас захардкожен)
  isLoading: boolean = true;

  constructor(
    private ticketService: TicketService,
    private seatService: SeatService,
    private userCartService: UserCartService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
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
    this.userCartService.addToCart(this.userId, seat.ticketId).subscribe(() => {
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
      return `Sector: ${seat.sectorName}, Row: ${seat.rowNumber}, Seat: ${seat.seatNumber}, Price: OUT_OF_STOCK`; 
    } 
    return `Sector: ${seat.sectorName}, Row: ${seat.rowNumber}, Seat: ${seat.seatNumber}${ seat.price 
      ? `, Price: ${seat.price} BYN` 
      : '' }`; 
  }

  goBack(): void {
    this.router.navigate(['/view-available-events']);
  }  
}
