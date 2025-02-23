import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { ArenaService } from '../../services/arena.service';
import { Arena } from '../../models/arena.model';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { PaginatorComponent } from '../../../../../shared/paginator/paginator.component';
import { NgIf } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FilterConfig, FilterComponent } from '../../../../../shared/filter/filter.component'; 

@Component({
  selector: 'app-arena-list',
  templateUrl: './arena-list.component.html',
  styleUrls: ['./arena-list.component.scss'],
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatTableModule,
    MatSortModule,
    HttpClientModule,
    ReactiveFormsModule,
    PaginatorComponent,
    NgIf,
    MatProgressSpinnerModule,
    FilterComponent
  ]
})
export class ArenaListComponent implements OnInit {
  displayedColumns: string[] = ['name', 'city', 'capacity', 'generalSeatsNumb', 'actions'];
  dataSource = new MatTableDataSource<Arena>();
  page: number = 0;
  size: number = 10;
  totalElements: number = 0;
  isLoading: boolean = true;

  @ViewChild(MatSort) sort!: MatSort;

  filters = {
    city: '',
    capacitySortOrder: '',
    seatsNumbSortOrder: ''
  };

  filterConfig: FilterConfig[] = [
    { label: 'City', formControlName: 'city', type: 'input'},
    { label: 'Capacity Sort Order', formControlName: 'capacitySortOrder', type: 'select', options: [
      { value: '', viewValue: '-- Sorting --' },
      { value: 'ASC', viewValue: 'Ascending' },
      { value: 'DESC', viewValue: 'Descending' }
    ]},
    { label: 'Seats Number Sort Order', formControlName: 'seatsNumbSortOrder', type: 'select', options: [
      { value: '', viewValue: '-- Sorting --' },
      { value: 'ASC', viewValue: 'Ascending' },
      { value: 'DESC', viewValue: 'Descending' }
    ]}
  ];

  constructor(private arenaService: ArenaService, private router: Router) { }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => {
      this.page = 0;
      this.loadArenas();
    });
    this.loadArenas();
  }

  async loadArenas() {
    this.isLoading = true;

    const sort = this.sort.active;
    const direction = this.sort.direction;
  
    this.arenaService.getArenas(
      this.filters.city, 
      this.filters.capacitySortOrder, 
      this.filters.seatsNumbSortOrder, 
      this.page, 
      this.size, 
      sort, 
      direction
    ).subscribe(data => {
      this.dataSource.data = data.content;
      this.totalElements = data.metadata.totalElements;
      this.isLoading = false;
    });
  }  

  onFilterChanged(filters: any): void {
    this.filters = filters;
    this.page = 0;
    this.loadArenas();
  }

  addArena(): void {
    this.router.navigate(['/admin/arenas/new']);
  }

  editArena(arena: Arena): void {
    this.router.navigate(['/admin/arenas/edit', arena.id]);
  }

  deleteArena(id: number): void {
    this.arenaService.deleteArena(id).subscribe(() => {
      this.loadArenas();
    });
  }

  onPageChange(newPage: number): void {
    this.page = newPage;
    this.loadArenas();
  }

  onSizeChange(newSize: number): void {
    this.size = newSize;
    this.page = 0;
    this.loadArenas();
  }

}