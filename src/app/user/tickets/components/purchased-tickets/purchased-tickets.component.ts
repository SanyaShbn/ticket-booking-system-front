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
import { AuthService } from '../../../../auth/services/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';

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
    TopBarComponent,
    TranslateModule
  ]
})
export class PurchasedTicketsComponent implements OnInit {
  purchasedTickets: any[] = [];
  displayedColumns: string[] = ['ticketId', 'eventName', 'eventDate', 'arena', 'seatInfo', 'price', 'actions'];
  eventId!: number;
  userId!: number;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.eventId = +params['eventId'] || 0;
    });

    const cachedUserId = this.authService.getUserId();
    if (cachedUserId) {
      this.userId = cachedUserId;
      this.loadPurchasedTickets();
    } else {
      const username = this.authService.getUsernameFromToken();
      if (username) {
        this.authService.getUserIdByUsername(username).subscribe(
          (id: number) => {
            this.userId = id;
            this.authService.setUserId(id);
            this.loadPurchasedTickets();
          },
          (error) => {
            console.error('Failed to fetch user ID:', error);
          }
        );
      } else {
        console.error('No username found in token.');
      }
    }
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
    doc.text(this.translate.instant('TICKET_INFO_TITLE'), 10, 10);

    doc.setFontSize(12);
    doc.text(`${this.translate.instant('TICKET_NUMBER')}: ${ticket.ticketId}`, 10, 30);
    doc.text(`${this.translate.instant('EVENT_NAME')}: ${ticket.eventName}`, 10, 40);
    doc.text(`${this.translate.instant('EVENT_DATE')}: ${new Date(ticket.eventDateTime).toLocaleDateString()}`, 10, 50);
    doc.text(`${this.translate.instant('EVENT_TIME')}: ${new Date(ticket.eventDateTime).toLocaleTimeString()}`, 10, 60);
    doc.text(`${this.translate.instant('ARENA')}: ${ticket.arenaName}, ${ticket.arenaCity}`, 10, 70);
    doc.text(`${this.translate.instant('SECTOR')}: ${ticket.sectorName}`, 10, 80);
    doc.text(`${this.translate.instant('ROW')}: ${ticket.rowNumber}`, 10, 90);
    doc.text(`${this.translate.instant('SEAT')}: ${ticket.seatNumber}`, 10, 100);
    doc.text(`${this.translate.instant('PRICE')}: ${ticket.price} BYN`, 10, 110);
  
    doc.save(`${this.translate.instant('TICKET_FILE_NAME_PREFIX')}-${ticket.ticketId}.pdf`);
  }

  goBack(): void {
    this.router.navigate(['/view-available-tickets'], { queryParams: { eventId: this.eventId } });
  }
}