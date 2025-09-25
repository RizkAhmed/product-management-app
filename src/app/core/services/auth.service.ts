import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { TokenResponse } from '../models/tokenResponse';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/Auth`;
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';

  constructor(private http: HttpClient, private router: Router) {}

  // Login
  login(credentials: {
    userName: string;
    password: string;
  }): Observable<TokenResponse> {
    return this.http
      .post<TokenResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) =>
          this.saveTokens(response.accessToken, response.refreshToken)
        )
      );
  }

  // Save tokens
  private saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  // Get tokens
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  // Check login
  isLoggedIn(): boolean {
    const token = this.getAccessToken();
    return !!token && !this.isTokenExpired(token);
  }

  // Logout
  logout(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.router.navigate(['/login']);
  }

  // Refresh token
  refreshToken(): Observable<TokenResponse> {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('Refresh token not found'));
    }

    return this.http
      .post<TokenResponse>(`${this.apiUrl}/refresh`, {
        token: accessToken,
        refreshToken: refreshToken,
      })
      .pipe(
        tap((response) =>
          this.saveTokens(response.accessToken, response.refreshToken)
        )
      );
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // expiry in ms
      return Date.now() > exp;
    } catch (e) {
      return true; // if invalid token → treat as expired
    }
  }
}
