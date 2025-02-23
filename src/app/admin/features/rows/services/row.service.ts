import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Row } from '../models/row.model';

@Injectable({
  providedIn: 'root'
})
export class RowService {
  private apiUrl = 'http://localhost:8080/api/admin/rows';

  constructor(private http: HttpClient) { }

  getRows(sectorId: number, rowNumberOrder: string, seatsNumbOrder: string, page: number, size: number): Observable<any> {
    let params = new HttpParams()
      .set('sectorId', sectorId.toString())
      .set('rowNumberOrder', rowNumberOrder)
      .set('seatsNumbOrder', seatsNumbOrder)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(this.apiUrl, { params });
  }

  getRow(id: number): Observable<Row> {
    return this.http.get<Row>(`${this.apiUrl}/${id}`);
  }

  createRow(sectorId: number, row: Row): Observable<Row> {
    return this.http.post<Row>(`${this.apiUrl}?sectorId=${sectorId}`, row);
  }

  updateRow(sectorId: number, id: number, row: Row): Observable<Row> {
    return this.http.put<Row>(`${this.apiUrl}/${id}?sectorId=${sectorId}`, row);
  }

  deleteRow(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}