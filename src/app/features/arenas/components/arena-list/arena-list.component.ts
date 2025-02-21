import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ArenaService } from '../../services/arena.service';
import { Arena } from '../../models/arena.model';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-arena-list',
  templateUrl: './arena-list.component.html',
  styleUrls: ['./arena-list.component.css'],
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    HttpClientModule,
    ReactiveFormsModule
  ]
})
export class ArenaListComponent implements OnInit {
  displayedColumns: string[] = ['name', 'city', 'capacity', 'generalSeatsNumb', 'actions'];
  dataSource = new MatTableDataSource<Arena>();
  filterForm: FormGroup;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private arenaService: ArenaService, private fb: FormBuilder, private router: Router) { 
    this.filterForm = this.fb.group({
      city: [''],
      capacitySortOrder: [''],
      seatsNumbSortOrder: ['']
    });
  }

  ngOnInit(): void {
    this.loadArenas();
  }

  loadArenas(): void {
    const city = this.filterForm.get('city')?.value || '';
    const capacitySortOrder = this.filterForm.get('capacitySortOrder')?.value || '';
    const seatsNumbSortOrder = this.filterForm.get('seatsNumbSortOrder')?.value || '';
    const page = this.paginator.pageIndex;
    const size = this.paginator.pageSize;
    const sort = this.sort.active;
    const direction = this.sort.direction;
    const filter = this.dataSource.filter;

    this.arenaService.getArenas(city, capacitySortOrder, seatsNumbSortOrder, page, size, sort, direction, filter).subscribe(data => {
      this.dataSource.data = data.content;
      this.paginator.length = data.totalElements;
    });
  }

  addArena(): void {
    this.router.navigate(['/arenas/new']);
  }

  editArena(arena: Arena): void {
    this.router.navigate(['/arenas/edit', arena.id]);
  }

  deleteArena(id: number): void {
    this.arenaService.deleteArena(id).subscribe(() => {
      this.loadArenas();
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.loadArenas();
  }
}