import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../config/environment';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserCartService {
  private apiUrl = environment.apiUrl + 'user_cart';

  constructor(private http: HttpClient) {}

  getUserCart(userId: number): Observable<any[]> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.get<any[]>(this.apiUrl, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching user cart:', error);
        return of([]);
      })
    );
  }

  addToCart(userId: number, ticketId: number): Observable<string> {
    const params = new HttpParams()
      .set('userId', userId.toString())
      .set('ticketId', ticketId.toString())
      .set('action', 'add');

    return this.http.post(this.apiUrl, {}, { params, responseType: 'text' });
  }

  removeFromCart(userId: number, ticketId: number): Observable<string> {
    const params = new HttpParams()
      .set('userId', userId.toString())
      .set('ticketId', ticketId.toString())
      .set('action', 'remove');

    return this.http.post(this.apiUrl, {}, { params, responseType: 'text' }).pipe(
      catchError((error) => {
        console.error('Error removing from cart:', error);
        return of('Failed to remove item from cart');
      })
    );
  }

  clearCart(userId: number): Observable<string> {
    const params = new HttpParams().set('userId', userId.toString()).set('action', 'clear');
    return this.http.post(this.apiUrl, {}, { params, responseType: 'text' }).pipe(
      catchError((error) => {
        console.error('Error clearing cart:', error);
        return of('Failed to clear cart');
      })
    );
  }
}