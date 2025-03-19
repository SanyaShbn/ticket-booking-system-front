import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import SockJS from 'sockjs-client';
import { Client, Message } from '@stomp/stompjs';
import { AuthService } from './auth/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateService  } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
 
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './i18n/', '.json');
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    MatFormFieldModule,
    MatSelectModule
  ],
   providers: [
      {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      },
      TranslateService
    ]
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'ticket-booking-system';
  status: string = '';
  private stompClient: Client | null = null;
  private statusTimeout: any;
  isAdmin: boolean = false;
  currentLang: string = 'en';

  
  constructor(
    private authService: AuthService,
    private ngZone: NgZone,
    private translate: TranslateService
  ) {
    const savedLang = localStorage.getItem('lang');
    if (savedLang) {
      this.currentLang = savedLang;
    }
    this.translate.setDefaultLang(this.currentLang);
    this.translate.use(this.currentLang);
  }

  ngOnInit() {
    console.log('Waiting for access token...');
    this.authService.waitForAccessToken().subscribe((token) => {
      if (token) {
        console.log('Access token is now available. Starting scheduler.');
        this.authService.startTokenRefreshScheduler();
  
        this.ngZone.runOutsideAngular(() => {
          this.initializeWebSocket();
        });
      } else {
        console.error('Access token is missing. Unable to start scheduler.');
      }
    });
  }

  private initializeWebSocket(): void {
    const socket = new SockJS('http://localhost:8081/ws');
    this.stompClient = new Client({
      webSocketFactory: () => socket,
    });

    this.stompClient.onConnect = () => {
      this.ngZone.run(() => {
        this.stompClient!.subscribe('/topic/status', (message: Message) => {
          this.status = message.body;

          this.statusTimeout = setTimeout(() => {
            this.status = '';
          }, 3000);
        });
      });
    };

    this.stompClient.activate();
  }

  ngOnDestroy() {
    if (this.statusTimeout) {
      clearTimeout(this.statusTimeout);
    }

    if (this.stompClient) {
      this.stompClient.deactivate();
    }

    this.authService.stopTokenRefreshScheduler();
  }

  closeStatusMessage() {
    this.status = '';
    if (this.statusTimeout) {
      clearTimeout(this.statusTimeout);
    }
  }

  switchLanguage(language: string): void {
    this.currentLang = language;
    this.translate.use(language);
    localStorage.setItem('lang', language);
  }

}