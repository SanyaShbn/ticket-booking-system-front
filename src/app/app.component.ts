import { Component, OnInit, OnDestroy, NgZone, ApplicationRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import SockJS from 'sockjs-client';
import { Client, Message } from '@stomp/stompjs';
import { AuthService } from './auth/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule
  ]
})
export class AppComponent implements OnInit, OnDestroy {

  constructor(
    private authService: AuthService,
    private ngZone: NgZone,
    private appRef: ApplicationRef
  ) {}

  title = 'ticket-booking-system';
  status: string = '';
  private stompClient: Client | null = null;
  private statusTimeout: any;
  isAdmin: boolean = false;

  ngOnInit() {
    console.log('Waiting for access token...');
    this.authService.waitForAccessToken().subscribe((token) => {
      console.log('Access token status:', token);
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

}