import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
  ) {}

  async canActivate(route: any): Promise<boolean> {
    const expectedRole = route.data.role;
    const userRole = this.authService.getUserRole();

    if (userRole === expectedRole) {
      return true;
    }

    console.error('Error!!! You can not have access to this resource because of unsuitable authority');
    return false;
  }
}