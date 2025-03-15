import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../config/environment';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TopBarComponent } from '../../shared/top-bar/top-bar.component';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-purchase-form',
  templateUrl: './purchase-form.component.html',
  styleUrls: ['./purchase-form.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    TopBarComponent
  ]
})
export class PurchaseFormComponent {
  eventId!: number;
  userId!: number;
  cardNumber: string = '';
  cardExpiry: string = '';
  cardCVC: string = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.eventId = +params['eventId'] || 0;
    });

    const cachedUserId = this.authService.getUserId();
    if (cachedUserId) {
      this.userId = cachedUserId;
    } else {
      const username = this.authService.getUsernameFromToken();
      if (username) {
        this.authService.getUserIdByUsername(username).subscribe(
          (id: number) => {
            this.userId = id;
            this.authService.setUserId(id);
          },
          (error) => {
            console.error('Failed to fetch user ID:', error);
          }
        );
      } else {
        console.error('No username found in token');
      }
    }
  }

  submitPurchase(): void {
    if (!this.userId) {
      this.showNotification('User ID not available. Please try again later.', 'error');
      return;
    }

    const apiUrl = `${environment.apiUrl}purchases`;
    const params = new HttpParams().set('userId', this.userId.toString());

    this.http.post(apiUrl, {}, { params, responseType: 'text' }).subscribe(
      (response: string) => {
        console.log('Purchase successful:', response);
        this.showNotification('Purchase Successful', 'success');
        this.router.navigate(['/purchasedTickets'], { queryParams: { eventId: this.eventId } });
      },
      (error) => {
        console.error('Error during purchase:', error);
        this.showNotification('Purchase Failed: Insufficient Funds', 'error');
      }
    );    
  }

  showNotification(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: type === 'success' ? 'snackbar-success' : 'snackbar-error'
    });
  }

  cancel(): void {
    this.router.navigate(['/view-available-tickets'], { queryParams: { eventId: this.eventId } });
  }
}