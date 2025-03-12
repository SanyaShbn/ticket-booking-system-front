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
    MatIconModule
  ]
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;
  errors: string[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  onRegister(): void {
    this.errors = [];

    if (this.password !== this.confirmPassword) {
      this.errors.push('Passwords do not match');
      return;
    }

    const userDto = { email: this.email, password: this.password, confirmPassword: this.confirmPassword };

    this.http.post(`${environment.apiUrl}` + `registration`, userDto).subscribe(
      () => {
        alert('Registration successful');
        this.router.navigate(['/login']);
      },
      (error) => {
        if (error.status === 400) {
          this.errors.push('Invalid registration data. Please check your input.');
        } else {
          this.errors.push('An unexpected error occurred. Please try again later.');
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