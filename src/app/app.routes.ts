import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArenaListComponent } from './admin/features/arenas/components/arena-list/arena-list.component';
import { ArenaFormComponent } from './admin/features/arenas/components/arena-form/arena-form.component';
import { AdminLayoutComponent } from './admin/admin-layout/admin-layout.component';

export const routes: Routes = [
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: 'arenas', component: ArenaListComponent },
      { path: 'arenas/new', component: ArenaFormComponent },
      { path: 'arenas/edit/:id', component: ArenaFormComponent },
    ]
  },
  { path: '', redirectTo: '/admin', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }