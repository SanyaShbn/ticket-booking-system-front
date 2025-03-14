import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../config/environment';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { TopBarComponent } from '../../../shared/top-bar/top-bar.component';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports:[
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    TopBarComponent,
    MatSnackBarModule
  ]
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  hidePassword: boolean = true;

  constructor(private http: HttpClient, private router: Router, private authService: AuthService,  private snackBar: MatSnackBar) {}

  onSubmit(): void {
    const body = { username: this.email, password: this.password };
    this.http.post(`${environment.apiUrl}` + `login`, body).subscribe(
      (response: any) => {
        this.authService.saveAccessToken(response.accessToken);
        this.authService.saveRefreshToken(response.refreshToken);

        const role = this.authService.getUserRole();

        if (role === 'ROLE_ADMIN') {
          this.snackBar.open('Login successful as Admin', 'Close', {
            duration: 3000,
            panelClass: ['snackbar-success']
          });
          this.router.navigate(['/admin/arenas']);
        } else if (role === 'ROLE_USER') {
          this.snackBar.open('Login successful', 'Close', {
            duration: 3000,
            panelClass: ['snackbar-success']
          });
          this.router.navigate(['/view-available-events']);
        }
      },
      (error) => {
        console.error('Login failed:', error);
        this.snackBar.open('Login failed (bad credentials). Please try again.', 'Close', {
           duration: 3000,
           panelClass: ['snackbar-error']
          });
        }
    );
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  navigateToRegister(): void {
    this.router.navigate(['/registration']);
  }
}