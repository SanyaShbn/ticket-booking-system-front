import { Injectable, NgZone } from '@angular/core';
import { Observable, Subscription, timer, of, BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../config/environment';
import { tap, map, switchMap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly ACCESS_TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private userId: number | null = null;
  private refreshSubscription: Subscription | null = null;
  private accessTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient, private ngZone: NgZone) {
    const token = this.getAccessToken();
    if (token) {
      this.accessTokenSubject.next(token);
    }
  }

  private isLocalStorageAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    return !!localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getAccessToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  decodeToken(token: string): any {
    try {
      return jwtDecode(token);
    } catch (error) {
      console.error('Failed to decode token', error);
      return null;
    }
  }

  getUsernameFromToken(): string | null {
    const token = this.getAccessToken();
    if (token) {
      const decoded = this.decodeToken(token);
      return decoded ? decoded.sub : null;
    }
    return null;
  }

  saveAccessToken(token: string): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
      this.accessTokenSubject.next(token); // Уведомляем об обновлении токена
    }
  }

  waitForAccessToken(): Observable<string | null> {
    return this.accessTokenSubject.asObservable(); // Подписка на изменения токена
  }

  saveRefreshToken(token: string): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    }
  }

  getUserRole(): string | null {
    const token = this.getAccessToken();
    if (!token) {
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const roles: string[] = payload.roles;

      return roles && roles.length > 0 ? roles[0] : null;
    } catch (error) {
      console.error('Failed to decode token or extract roles:', error);
      return null;
    }
  }

  setUserId(id: number): void {
    this.userId = id;
  }

  getUserId(): number | null {
    return this.userId;
  }

  isUserIdAvailable(): boolean {
    return this.userId !== null;
  }

  getUserIdByUsername(username: string): Observable<number> {
    return this.http.get<number>(`${environment.apiUrl}` + `users/id?username=${username}`);
  }

  clearTokens(): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }
  }

  logout(): Observable<void> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available for logout');
    }
  
    const headers = new HttpHeaders().set('Refresh-Token', refreshToken);
  
    return new Observable<void>((observer) => {
      this.http.post<void>(`${environment.apiUrl}` + `logout`, {}, { headers }).subscribe({
        next: () => {
          this.clearTokens();
          observer.next();
          observer.complete();
        },
        error: (err) => {
          console.error('Logout failed:', err);
          observer.error(err);
        }
      });
    });
  }  

  refreshToken(): Observable<string> {
    console.log("Refreshing token...")
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      return of('');
    }

    const apiUrl = `${environment.apiUrl}refresh`;
    return this.http.post<{ accessToken: string; refreshToken: string }>(apiUrl, { refreshToken }).pipe(
      tap(response => {
        this.saveAccessToken(response.accessToken);
        this.saveRefreshToken(response.refreshToken);
      }),
      map(response => response.accessToken)
    );
  }

  startTokenRefreshScheduler(): void {
    this.ngZone.runOutsideAngular(() => {
      const accessToken = this.getAccessToken();
  
      if (accessToken) {
        const expiryTime = this.getTokenExpiry(accessToken);
        const now = Date.now();
        const delay = expiryTime - now - 10_000;
  
        if (delay > 0) {
          console.log(`Token refresh scheduled in ${delay / 1000} seconds.`);
  
          this.refreshSubscription = timer(delay, expiryTime - now).pipe(
            switchMap(() => this.refreshToken())
          ).subscribe({
            next: () => {
              console.log('Token successfully refreshed.');
            },
            error: (error) => {
              console.error('Error refreshing token:', error);
              this.clearTokens();
            }
          });
        } else {
          console.warn('Token already expired. Refresh immediately if needed.');
        }
      } else {
        console.warn('Access token or refresh token is missing. Scheduler not started.');
      }
    });
  }

  stopTokenRefreshScheduler(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
      this.refreshSubscription = null;
    }
  }

  private getTokenExpiry(token: string): number {
    const decoded: any = this.decodeToken(token);
    return decoded?.exp ? decoded.exp * 1000 : 0;
  }
}