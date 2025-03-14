import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogActions } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-logout-confirmation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatDialogActions
  ],
  templateUrl: './logout-confirmation-dialog.component.html',
  styleUrl: './logout-confirmation-dialog.component.scss'
})
export class LogoutConfirmationDialogComponent {

}
