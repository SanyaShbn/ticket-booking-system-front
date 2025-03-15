import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { SectorService } from '../../services/sector.service';
import { Sector } from '../../models/sector.model';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { PaginatorComponent } from '../../../../../shared/paginator/paginator.component';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FilterConfig, FilterComponent } from '../../../../../shared/filter/filter.component'; 
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-sector-list',
  templateUrl: './sector-list.component.html',
  styleUrls: ['./sector-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    FilterComponent,
    PaginatorComponent,
    ReactiveFormsModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    NgIf,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ]
})
export class SectorListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['sectorName', 'maxRowsNumb', 'availableRowsNumb', 'maxSeatsNumb', 'availableSeatsNumb', 'actions'];
  dataSource = new MatTableDataSource<Sector>();
  page: number = 0;
  size: number = 10;
  totalElements: number = 0;
  arenaId!: number;
  isLoading: boolean = true;

  @ViewChild(MatSort) sort!: MatSort;

  filters = {
    nameSortOrder: '',
    maxRowsNumbSortOrder: '',
    maxSeatsNumbSortOrder: ''
  };

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

  constructor(private sectorService: SectorService, private router: Router, private route: ActivatedRoute, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.arenaId = +params['arenaId'] || 0;
      this.loadSectors();
    });
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => {
      this.page = 0;
      this.loadSectors();
    });
  }

  loadSectors(): void {
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

  addSector(): void {
    this.router.navigate(['/admin/sectors/list/new'], { queryParams: { arenaId: this.arenaId } });
  }

  editSector(sector: Sector): void {
    this.router.navigate(['/admin/sectors/list/edit', sector.id], { queryParams: { arenaId: this.arenaId } });
  }

  deleteSector(id: number): void {
    this.sectorService.deleteSector(id).subscribe(() => {
      this.snackBar.open('Sector deleted successfully', 'Close', {
        duration: 3000
      });
      this.loadSectors();
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/sectors']);
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