import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ticket } from '../models/ticket.model';
import { environment } from '../../../../../config/environment'

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private apiUrl = environment.apiUrl + 'admin/tickets';

  constructor(private http: HttpClient) {}

  getTickets(
    eventId: number,
    priceSortOrder: string,
    page: number,
    size: number
  ): Observable<any> {
    let params = new HttpParams()
      .set('eventId', eventId.toString())
      .set('priceSortOrder', priceSortOrder)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(this.apiUrl, { params });
  }

  getTicketById(ticketId: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/${ticketId}`);
  }

  createTicket(
    eventId: number,
    seatId: number,
    ticket: Ticket
  ): Observable<Ticket> {
    const params = new HttpParams()
      .set('eventId', eventId.toString())
      .set('seatId', seatId.toString());

    return this.http.post<Ticket>(this.apiUrl, ticket, { params });
  }

  updateTicket(
    eventId: number,
    seatId: number,
    ticketId: number,
    ticket: Ticket
  ): Observable<Ticket> {
    const params = new HttpParams()
      .set('eventId', eventId.toString())
      .set('seatId', seatId.toString());

    return this.http.put<Ticket>(`${this.apiUrl}/${ticketId}`, ticket, { params });
  }

  deleteTicket(ticketId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${ticketId}`);
  }
}