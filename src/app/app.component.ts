import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TopBarComponent } from './shared/top-bar/top-bar.component';
import { SideNavComponent } from './shared/side-nav/side-nav.component';
import SockJS from 'sockjs-client';
import { Client, Message } from '@stomp/stompjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    RouterOutlet,
    TopBarComponent,
    SideNavComponent,
    CommonModule
  ]
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'ticket-booking-system';
  status: string = '';
  private stompClient: Client | null = null;
  private statusTimeout: any;

  ngOnInit() {
    const socket = new SockJS('http://localhost:8081/ws');
    this.stompClient = new Client({
      webSocketFactory: () => socket,
    });

    this.stompClient.onConnect = () => {
      this.stompClient!.subscribe('/topic/status', (message: Message) => {
        this.status = message.body;

        this.statusTimeout = setTimeout(() => {
          this.status = '';
        }, 3000);
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
  }

  closeStatusMessage() {
    this.status = '';
    if (this.statusTimeout) {
      clearTimeout(this.statusTimeout);
    }
  }
}