import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArenaListComponent } from './features/arenas/components/arena-list/arena-list.component';
import { ArenaFormComponent } from './features/arenas/components/arena-form/arena-form.component';

export const routes: Routes = [
  { path: 'arenas', component: ArenaListComponent },
  { path: 'arenas/new', component: ArenaFormComponent },
  { path: 'arenas/edit/:id', component: ArenaFormComponent },
  { path: '', redirectTo: '/arenas', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }