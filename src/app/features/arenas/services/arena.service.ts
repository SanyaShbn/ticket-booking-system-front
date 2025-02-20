import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Arena } from '../models/arena.model';

@Injectable({
  providedIn: 'root'
})
export class ArenaService {
  private apiUrl = 'http://localhost:8080/api/admin/arenas';

  constructor(private http: HttpClient) { }

  getArenas(): Observable<Arena[]> {
    return this.http.get<Arena[]>(this.apiUrl);
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

  deleteArena(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}