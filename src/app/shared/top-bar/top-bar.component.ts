import { Component, Input, OnInit, OnDestroy } from '@angular/core';
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
import { Subscription } from 'rxjs';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

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
export class TopBarComponent implements OnInit, OnDestroy {
  @Input() showLogout: boolean = true;
  @Input() title: string = '';

  private langChangeSubscription!: Subscription;

  constructor(
    private dialog: MatDialog,
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService
  ) {}
  
  ngOnInit(): void {
    this.setTitle();

    this.langChangeSubscription = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.setTitle();
    });
  }

  ngOnDestroy(): void {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }

  private setTitle(): void {
    if (!this.title) {
      this.translate.get('APP_TITLE').subscribe((translatedTitle) => {
        this.title = translatedTitle;
      });
    }
  }

  openLogoutDialog(): void {
    const dialogRef = this.dialog.open(LogoutConfirmationDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
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
        this.translate.get('LOGOUT_FAILURE').subscribe((message) => {
          alert(message);
        });
      }
    );
  }
}
