import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopBarComponent } from '../../shared/top-bar/top-bar.component';
import { SideNavComponent } from '../../shared/side-nav/side-nav.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-layout',
  imports: [ 
    RouterOutlet,
    TopBarComponent,
    SideNavComponent,
    TranslateModule
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
  standalone: true,
})
export class AdminLayoutComponent {

}
