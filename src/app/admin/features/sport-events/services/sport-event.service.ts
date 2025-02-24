import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SportEvent } from '../models/sport-event.model';
import { environment } from '../../../../../config/environment'

@Injectable({
  providedIn: 'root'
})
export class SportEventService {
  private apiUrl = environment.apiUrl + 'admin/sport_events';

  constructor(private http: HttpClient) { }

  getSportEvents(startDate: Date, endDate: Date, arenaId: number, sortOrder: string, page: number, size: number): Observable<any> {
    let params = new HttpParams()
      .set('startDate', startDate.toISOString().slice(0, 19))
      .set('endDate', endDate.toISOString().slice(0, 19))
      .set('sortOrder', sortOrder)
      .set('page', page.toString())
      .set('size', size.toString());

      if (arenaId != 0) {
        params = params.set('arenaId', arenaId.toString());
      }

    return this.http.get<any>(this.apiUrl, { params });
  }

  getSportEvent(id: number): Observable<SportEvent> {
    return this.http.get<SportEvent>(`${this.apiUrl}/${id}`);
  }

  createSportEvent(arenaId: number, sportEvent: SportEvent): Observable<SportEvent> {
    return this.http.post<SportEvent>(`${this.apiUrl}?arenaId=${arenaId}`, sportEvent);
  }

  updateSportEvent(arenaId: number, id: number, sportEvent: SportEvent): Observable<SportEvent> {
    return this.http.put<SportEvent>(`${this.apiUrl}/${id}?arenaId=${arenaId}`, sportEvent);
  }

  deleteSportEvent(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}