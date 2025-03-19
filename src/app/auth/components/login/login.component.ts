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
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
    MatSnackBarModule,
    TranslateModule
  ],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  hidePassword: boolean = true;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService, 
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  onSubmit(): void {
    const body = { username: this.email, password: this.password };
    this.http.post(`${environment.apiUrl}` + `login`, body).subscribe(
      (response: any) => {
        this.authService.saveAccessToken(response.accessToken);
        this.authService.saveRefreshToken(response.refreshToken);

        const role = this.authService.getUserRole();

        if (role === 'ROLE_ADMIN') {
          this.translate.get('LOGIN_SUCCESS_ADMIN').subscribe((message) => {
            this.snackBar.open(message, this.translate.instant('CLOSE'), {
              duration: 3000,
              panelClass: ['snackbar-success']
            });
          });
          this.router.navigate(['/admin/arenas']);
        } else if (role === 'ROLE_USER') {
          this.translate.get('LOGIN_SUCCESS_USER').subscribe((message) => {
            this.snackBar.open(message, this.translate.instant('CLOSE'), {
              duration: 3000,
              panelClass: ['snackbar-success']
            });
          });
          this.router.navigate(['/view-available-events']);
        }
      },
      (error) => {
        console.error('Login failed:', error);
        this.translate.get('LOGIN_FAILED').subscribe((message) => {
          this.snackBar.open(message, this.translate.instant('CLOSE'), {
            duration: 3000,
            panelClass: ['snackbar-error']
          });
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