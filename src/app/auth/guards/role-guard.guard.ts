import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  canActivate(route: any): boolean {
    const expectedRole = route.data.role;
    const userRole = this.authService.getUserRole();

    if (userRole === expectedRole) {
      return true;
    }

    this.translate.get('ACCESS_DENIED_MESSAGE').subscribe((message) => {
      this.snackBar.open(message, this.translate.instant('CLOSE'), {
        duration: 3000,
        panelClass: 'snackbar-error'
      });
    });

    return false;
  }
}