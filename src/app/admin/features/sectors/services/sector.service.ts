import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sector } from '../models/sector.model';
import { environment } from '../../../../../config/environment'

@Injectable({
  providedIn: 'root'
})
export class SectorService {
  private apiUrl = environment.apiUrl + 'admin/sectors';

  constructor(private http: HttpClient) { }

  getSectors(arenaId: number, nameSortOrder: string, maxRowsNumbSortOrder: string, maxSeatsNumbSortOrder: string, page: number, size: number): Observable<any> {
    let params = new HttpParams()
      .set('arenaId', arenaId.toString())
      .set('nameSortOrder', nameSortOrder)
      .set('maxRowsNumbSortOrder', maxRowsNumbSortOrder)
      .set('maxSeatsNumbSortOrder', maxSeatsNumbSortOrder)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(this.apiUrl, { params });
  }

  getSector(id: number): Observable<Sector> {
    return this.http.get<Sector>(`${this.apiUrl}/${id}`);
  }

  createSector(arenaId: number, sector: Sector): Observable<Sector> {
    return this.http.post<Sector>(`${this.apiUrl}?arenaId=${arenaId}`, sector);
  }

  updateSector(arenaId: number, id: number, sector: Sector): Observable<Sector> {
    return this.http.put<Sector>(`${this.apiUrl}/${id}?arenaId=${arenaId}`, sector);
  }

  deleteSector(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}