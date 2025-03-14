import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../config/environment';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly ACCESS_TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';

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

  getUserIdByUsername(username: string): Observable<number> {
    return this.http.get<number>(`${environment.apiUrl}` + `users/id?username=${username}`);
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
}