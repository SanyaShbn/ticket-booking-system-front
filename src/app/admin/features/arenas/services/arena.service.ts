import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Arena } from '../models/arena.model';
import { environment } from '../../../../../config/environment';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ArenaService {
  private apiUrl = environment.apiUrl + 'admin/arenas';

  constructor(private http: HttpClient) { }

  getArenas(city: string, capacitySortOrder: string, seatsNumbSortOrder: string, page: number, size: number, 
    sort: string, direction: string): Observable<any> {
    let params = new HttpParams()
      .set('city', city)
      .set('capacitySortOrder', capacitySortOrder)
      .set('seatsNumbSortOrder', seatsNumbSortOrder)
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort)
      .set('direction', direction);

    return this.http.get<any>(this.apiUrl, { params });
  }

  getArenasForSportEvents(page: number, size: number): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

      return this.http.get<any>(`${this.apiUrl}/search`, { params }).pipe(
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

  getArena(id: number): Observable<Arena> {
    return this.http.get<Arena>(`${this.apiUrl}/${id}`);
  }

  createArena(arena: Arena): Observable<Arena> {
    return this.http.post<Arena>(this.apiUrl, arena);
  }

  updateArena(id: number, arena: Arena): Observable<Arena> {
    return this.http.put<Arena>(`${this.apiUrl}/${id}`, arena);
  }

  deleteArena(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}