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

  getSportEvents(
    startDate: Date | null,
    endDate: Date | null,
    arenaName: string,
    sortOrder: string,
    page: number,
    size: number
  ): Observable<any> {
    let params = new HttpParams()
      .set('arenaName', arenaName)
      .set('sortOrder', sortOrder)
      .set('page', page.toString())
      .set('size', size.toString());

      if (startDate) {
        params = params.set('startDate', startDate.toISOString().slice(0, 19));
      }

      if (endDate) {
        params = params.set('endDate', endDate.toISOString().slice(0, 19));
      }

    return this.http.get<any>(this.apiUrl, { params });
  }

  getSportEvent(id: number): Observable<SportEvent> {
    return this.http.get<SportEvent>(`${this.apiUrl}/${id}`);
  }

  createSportEvent(arenaId: number, sportEvent: SportEvent): Observable<SportEvent> {
    const formData: FormData = new FormData();
    formData.append('arenaId', arenaId.toString());
    formData.append('eventName', sportEvent.eventName);

    const localDateTime = new Date(sportEvent.eventDateTime.getTime() - sportEvent.eventDateTime.getTimezoneOffset() * 60000);
    formData.append('eventDateTime', localDateTime.toISOString().slice(0, 19));

    if (sportEvent.posterImage) {
        formData.append('imageFile', sportEvent.posterImage);
    }

    return this.http.post<SportEvent>(this.apiUrl, formData);
  }

  updateSportEvent(arenaId: number, id: number, sportEvent: SportEvent): Observable<SportEvent> {
    const formData: FormData = new FormData();
    formData.append('arenaId', arenaId.toString());
    formData.append('eventName', sportEvent.eventName);

    const localDateTime = new Date(sportEvent.eventDateTime.getTime() - sportEvent.eventDateTime.getTimezoneOffset() * 60000);
    formData.append('eventDateTime', localDateTime.toISOString().slice(0, 19));

    if (sportEvent.posterImage) {
        formData.append('imageFile', sportEvent.posterImage);
    }

    return this.http.put<SportEvent>(`${this.apiUrl}/${id}`, formData);

  }

  deleteSportEvent(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  getPosterImage(filename: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/poster/${filename}`, { responseType: 'blob' });
  }

  deletePosterImage(filename: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/poster/${filename}`);
  }
}