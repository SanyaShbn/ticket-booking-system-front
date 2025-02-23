import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { SectorService } from '../../services/sector.service';
import { Sector } from '../../models/sector.model';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { PaginatorComponent } from '../../../../../shared/paginator/paginator.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { NgIf } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FilterConfig, FilterComponent } from '../../../../../shared/filter/filter.component'; 

@Component({
  selector: 'app-sector-selection',
  templateUrl: './sector-selection.component.html',
  styleUrls: ['./sector-selection.component.scss'],
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
export class SectorSelectionComponent implements OnInit, AfterViewInit {
  dataSource = new MatTableDataSource<Sector>();
  page: number = 0;
  size: number = 10;
  totalElements: number = 0;
  isLoading: boolean = true;
  arenaId!: number;

  @ViewChild(MatSort) sort!: MatSort;

  filterConfig: FilterConfig[] = [
    { label: 'Name Sort Order', formControlName: 'nameSortOrder', type: 'select', options: [
      { value: '', viewValue: '-- Sorting --' },
      { value: 'ASC', viewValue: 'Ascending' },
      { value: 'DESC', viewValue: 'Descending' }
    ]},
    { label: 'Max Rows Number Sort Order', formControlName: 'maxRowsNumbSortOrder', type: 'select', options: [
      { value: '', viewValue: '-- Sorting --' },
      { value: 'ASC', viewValue: 'Ascending' },
      { value: 'DESC', viewValue: 'Descending' }
    ]},
    { label: 'Max Seats Number Sort Order', formControlName: 'maxSeatsNumbSortOrder', type: 'select', options: [
      { value: '', viewValue: '-- Sorting --' },
      { value: 'ASC', viewValue: 'Ascending' },
      { value: 'DESC', viewValue: 'Descending' }
    ]}
  ];

  filters = {
    nameSortOrder: '',
    maxRowsNumbSortOrder: '',
    maxSeatsNumbSortOrder: ''
  };

  constructor(private sectorService: SectorService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.arenaId = +params['arenaId'] || 0;
      this.loadSectors();
    });
  }

  ngAfterViewInit(): void {
    if (this.sort) {
      this.sort.sortChange.subscribe(() => {
        this.page = 0;
        this.loadSectors();
      });
    }
    this.loadSectors();
  }  

  async loadSectors() {    
    this.isLoading = true;

    this.sectorService.getSectors(
      this.arenaId,
      this.filters.nameSortOrder, 
      this.filters.maxRowsNumbSortOrder, 
      this.filters.maxSeatsNumbSortOrder, 
      this.page, 
      this.size
    ).subscribe(data => {
      this.dataSource.data = data.content;
      this.totalElements = data.metadata.totalElements;
      this.isLoading = false;
    });
  }  

  onFilterChanged(filters: any): void {
    this.filters = filters;
    this.page = 0;
    this.loadSectors();
  }

  selectSector(sectorId: number): void {
    this.router.navigate(['/admin/rows/list'], { queryParams: { sectorId: sectorId, arenaId: this.arenaId } });
  }

  goBack(): void {
    this.router.navigate(['/admin/rows']);
  }  

  onPageChange(newPage: number): void {
    this.page = newPage;
    this.loadSectors();
  }

  onSizeChange(newSize: number): void {
    this.size = newSize;
    this.page = 0;
    this.loadSectors();
  }
}