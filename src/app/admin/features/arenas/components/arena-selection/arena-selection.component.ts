import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { ArenaService } from '../../services/arena.service';
import { Arena } from '../../models/arena.model';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ArenaFilterComponent } from '../arena-filter/arena-filter.component';
import { PaginatorComponent } from '../../../../../shared/paginator/paginator.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-arena-selection',
  templateUrl: './arena-selection.component.html',
  styleUrls: ['./arena-selection.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ArenaFilterComponent,
    PaginatorComponent,
    MatCardModule,
    MatButtonModule
  ]
})
export class ArenaSelectionComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['name', 'city', 'capacity', 'generalSeatsNumb', 'actions'];
  dataSource = new MatTableDataSource<Arena>();
  page: number = 0;
  size: number = 10;
  totalElements: number = 0;

  @ViewChild(MatSort) sort!: MatSort;

  filters = {
    city: '',
    capacitySortOrder: '',
    seatsNumbSortOrder: ''
  };

  constructor(private arenaService: ArenaService, private router: Router) { }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (this.sort) {
      this.sort.sortChange.subscribe(() => {
        this.page = 0;
        this.loadArenas();
      });
    }
    this.loadArenas();
  }  

  async loadArenas() {
    const sort = this.sort ? this.sort.active : '';
    const direction = this.sort ? this.sort.direction : '';

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
    });
  }  

  onFilterChanged(filters: any): void {
    this.filters = filters;
    this.page = 0;
    this.loadArenas();
  }

  selectArena(arenaId: number): void {
    this.router.navigate(['/admin/sectors/list'], { queryParams: { arenaId: arenaId } });
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