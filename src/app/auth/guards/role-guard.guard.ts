import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  canActivate(route: any): boolean {
    const expectedRole = route.data.role;
    const userRole = this.authService.getUserRole();

    if (userRole === expectedRole) {
      return true;
    }

    this.snackBar.open('Access Denied: You do not have the required role', 'Close', {
      duration: 3000,
      panelClass: 'snackbar-error'
    });

    return false;
  }
}