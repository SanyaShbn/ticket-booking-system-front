import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-top-bar',
  imports: [
    MatToolbarModule
  ],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.scss'
})
export class TopBarComponent {
  title: string = 'Module';

  // constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // // Настраиваем заголовок в зависимости от роли
    // this.title = this.authService.getUserRole() === 'admin' ? 'Admin Module' : 'User Module';
    this.title = 'User Module';
  }

}
