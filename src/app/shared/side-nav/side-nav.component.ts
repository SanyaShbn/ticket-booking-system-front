import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-side-nav',
  imports: [
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    RouterModule
  ],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.scss',
  standalone: true
})
export class SideNavComponent {
  showMenu = false;

  toggleMenu(): void {
    this.showMenu = !this.showMenu;
  }
}