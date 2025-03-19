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
import { TopBarComponent } from '../../../shared/top-bar/top-bar.component';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
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
  ]
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;
  errors: string[] = [];

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  onRegister(): void {
    this.errors = [];

    if (this.password !== this.confirmPassword) {
      this.translate.get('PASSWORDS_DO_NOT_MATCH').subscribe((message) => {
        this.errors.push(message);
      });
      return;
    }

    const userDto = { email: this.email, password: this.password, confirmPassword: this.confirmPassword };

    this.http.post(`${environment.apiUrl}` + `users/registration`, userDto).subscribe(
      () => {
        this.translate.get('REGISTRATION_SUCCESS').subscribe((message) => {
          this.snackBar.open(message, this.translate.instant('CLOSE'), {
            duration: 3000,
            panelClass: ['snackbar-success']
          });
        });
        this.router.navigate(['/login']);
      },
      (error) => {
        if (error.status === 409) {
          this.translate.get('REGISTRATION_DUPLICATE').subscribe((message) => {
            this.snackBar.open(message, this.translate.instant('CLOSE'), {
              duration: 3000,
              panelClass: ['snackbar-error']
            });
          });
        } else {
          this.translate.get('REGISTRATION_FAILURE').subscribe((message) => {
          this.snackBar.open(message, this.translate.instant('CLOSE'), {
            duration: 3000,
            panelClass: ['snackbar-error']
          });
        });
        }
      }
    );
  }
  
  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}