import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../auth/services/auth.service';
import { Router } from '@angular/router';
import { LogoutConfirmationDialogComponent } from '../logout-confirmation-dialog/logout-confirmation-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-top-bar',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.scss',
  standalone: true
})
export class TopBarComponent {
  @Input() showLogout: boolean = true;
  @Input() title: string = 'Welcome to our ticket booking app';

  constructor(private dialog: MatDialog, private authService: AuthService, private router: Router) {}

  openLogoutDialog(): void {
    const dialogRef = this.dialog.open(LogoutConfirmationDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Dialog result: true true');
        this.onLogout();
      }
    });
  }

  onLogout(): void {
    this.authService.logout().subscribe(
      () => {
        this.router.navigate(['/']);
      },
      (error) => {
        console.error('Logout failed:', error);
        alert('Logout failed. Please try again.');
      }
    );
  }
}
