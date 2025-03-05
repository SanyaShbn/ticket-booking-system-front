import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../../config/environment';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SeatService {
  private apiUrl = environment.apiUrl + 'admin/seats';

  constructor(private http: HttpClient) {}

  findAvailableSeatsWhenAddingNewTicket(
    eventId: number,
    page: number,
    size: number
  ): Observable<any> {
    let params = new HttpParams()
      .set('eventId', eventId.toString())
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(this.apiUrl + '/when_ticket_create', { params }).pipe(
      map(response => ({
        content: response.content,
        totalPages: Math.ceil(response.metadata.totalElements / size)
      })),
      catchError(() => {
        console.error('Error fetching arenas');
        return of({ content: [], totalPages: 0 });
      })
    );
  }

  findAvailableSeatsWhenUpdatingExistingTicket(
    eventId: number,
    seatId: number,
    page: number,
    size: number
  ): Observable<any> {
    let params = new HttpParams()
      .set('eventId', eventId.toString())
      .set('seatId', seatId)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(this.apiUrl + '/when_ticket_update', { params }).pipe(
      map(response => ({
        content: response.content,
        totalPages: Math.ceil(response.metadata.totalElements / size)
      })),
      catchError(() => {
        console.error('Error fetching arenas');
        return of({ content: [], totalPages: 0 });
      })
    );
  }

}