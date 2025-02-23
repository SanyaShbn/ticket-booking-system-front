import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArenaListComponent } from './admin/features/arenas/components/arena-list/arena-list.component';
import { ArenaFormComponent } from './admin/features/arenas/components/arena-form/arena-form.component';
import { AdminLayoutComponent } from './admin/admin-layout/admin-layout.component';
import { SectorListComponent } from './admin/features/sectors/components/sector-list/sector-list.component';
import { SectorFormComponent } from './admin/features/sectors/components/sector-form/sector-form.component';
import { ArenaSelectionComponent } from './admin/features/arenas/components/arena-selection/arena-selection.component';

export const routes: Routes = [
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: 'arenas', component: ArenaListComponent },
      { path: 'arenas/new', component: ArenaFormComponent },
      { path: 'arenas/edit/:id', component: ArenaFormComponent },
      { path: 'sectors', component: ArenaSelectionComponent },
      { path: 'sectors/list', component: SectorListComponent },
      { path: 'sectors/list/new', component: SectorFormComponent },
      { path: 'sectors/list/edit/:id', component: SectorFormComponent },
    ]
  },
  { path: '', redirectTo: '/admin', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }