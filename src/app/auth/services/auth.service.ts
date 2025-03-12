import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../config/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly ACCESS_TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private roleSubject = new BehaviorSubject<string | null>(null);

  role$ = this.roleSubject.asObservable();

  constructor(private http: HttpClient) {}

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

  saveAccessToken(token: string): void {
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
    }
  }

  saveRefreshToken(token: string): void {
    if (typeof window !== 'undefined' && localStorage) {
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

  updateRole(): void {
    const role = this.getUserRole();
    this.roleSubject.next(role);
  }

  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  logout(): Observable<void> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available for logout');
    }
  
    const headers = new HttpHeaders().set('Refresh-Token', refreshToken);
  
    return new Observable<void>((observer) => {
      this.http.post<void>(`${environment.apiUrl}/logout`, {}, { headers }).subscribe({
        next: () => {
          this.clearTokens();
          this.updateRole();
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
}