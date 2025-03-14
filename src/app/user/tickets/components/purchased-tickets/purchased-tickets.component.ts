import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from '../../../../../config/environment';
import { jsPDF } from 'jspdf';
import '../../../../../fonts/Roboto-Regular-normal.js';
import { TopBarComponent } from '../../../../shared/top-bar/top-bar.component';

@Component({
  selector: 'app-purchased-tickets',
  templateUrl: './purchased-tickets.component.html',
  styleUrls: ['./purchased-tickets.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    TopBarComponent
  ]
})
export class PurchasedTicketsComponent implements OnInit {
  purchasedTickets: any[] = [];
  displayedColumns: string[] = ['ticketId', 'eventName', 'eventDate', 'arena', 'seatInfo', 'price', 'actions'];
  userId: number = 12; // Пока все еще хардкожу ID
  eventId!: number;

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.eventId = +params['eventId'] || 0;
    });
    this.loadPurchasedTickets();
  }

  loadPurchasedTickets(): void {
    const apiUrl = `${environment.apiUrl}purchases/purchasedTickets`;
    this.http.get<any[]>(apiUrl, { params: { userId: this.userId.toString() } }).subscribe(
      (response) => {
        this.purchasedTickets = response;
      },
      (error) => {
        console.error('Error loading purchased tickets:', error);
      }
    );
  }

  downloadPDF(ticket: any): void {
    const doc = new jsPDF();

    doc.setFont('Roboto-Regular', 'normal');
  
    doc.setFontSize(20);
    doc.text('Ticket Information', 10, 10);

    doc.setFontSize(12);
    doc.text(`Ticket Numb.: ${ticket.ticketId}`, 10, 30);
    doc.text(`Event Name: ${ticket.eventName}`, 10, 40);
    doc.text(`Date: ${new Date(ticket.eventDateTime).toLocaleDateString()}`, 10, 50);
    doc.text(`Time: ${new Date(ticket.eventDateTime).toLocaleTimeString()}`, 10, 60);
    doc.text(`Arena: ${ticket.arenaName}, ${ticket.arenaCity}`, 10, 70);
    doc.text(`Sector: ${ticket.sectorName}`, 10, 80);
    doc.text(`Row: ${ticket.rowNumber}`, 10, 90);
    doc.text(`Seat: ${ticket.seatNumber}`, 10, 100);
    doc.text(`Price: ${ticket.price} BYN`, 10, 110);

    doc.save(`ticket-${ticket.ticketId}.pdf`);
  }

  goBack(): void {
    this.router.navigate(['/view-available-tickets'], { queryParams: { eventId: this.eventId } });
  }
}