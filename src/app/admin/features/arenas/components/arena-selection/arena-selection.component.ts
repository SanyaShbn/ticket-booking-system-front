import { Component, OnInit, ViewChild, AfterViewInit, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { ArenaService } from '../../services/arena.service';
import { Arena } from '../../models/arena.model';
import { Router, ActivatedRoute  } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { PaginatorComponent } from '../../../../../shared/paginator/paginator.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { NgIf } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FilterConfig, FilterComponent } from '../../../../../shared/filter/filter.component'; 

@Component({
  selector: 'app-arena-selection',
  templateUrl: './arena-selection.component.html',
  styleUrls: ['./arena-selection.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FilterComponent,
    PaginatorComponent,
    MatCardModule,
    MatButtonModule,
    NgIf,
    MatProgressSpinnerModule
  ]
})
export class ArenaSelectionComponent implements OnInit, AfterViewInit {
  @Input() navigateTo: string = '/admin/sectors/list';
  
  dataSource = new MatTableDataSource<Arena>();
  page: number = 0;
  size: number = 10;
  totalElements: number = 0;
  isLoading: boolean = true;

  @ViewChild(MatSort) sort!: MatSort;

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

  filters = {
    city: '',
    capacitySortOrder: '',
    seatsNumbSortOrder: ''
  };

  constructor(private arenaService: ArenaService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.navigateTo = data['navigateTo'] || this.navigateTo;
    });
  }

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
    this.isLoading = true;

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
      this.isLoading = false;
    });
  }  

  onFilterChanged(filters: any): void {
    this.filters = filters;
    this.page = 0;
    this.loadArenas();
  }

  selectArena(arenaId: number): void {
    this.router.navigate([this.navigateTo], { queryParams: { arenaId: arenaId } });
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