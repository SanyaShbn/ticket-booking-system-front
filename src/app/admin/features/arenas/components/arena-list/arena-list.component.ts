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
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar'; 
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

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
    FilterComponent,
    MatSnackBarModule,
    TranslateModule
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

  filterConfig: FilterConfig[] = [];
  private langChangeSubscription!: Subscription;

  constructor(
    private arenaService: ArenaService,
    private router: Router,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.updateFilterConfig();

    this.langChangeSubscription = this.translate.onLangChange.subscribe(() => {
      this.updateFilterConfig();
    });
  }

  ngOnDestroy(): void {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }

  updateFilterConfig(): void {
    this.filterConfig = [
      { label: this.translate.instant('FILTER_CITY'), formControlName: 'city', type: 'input' },
      { label: this.translate.instant('FILTER_CAPACITY_SORT'), formControlName: 'capacitySortOrder', type: 'select', options: [
        { value: '', viewValue: this.translate.instant('FILTER_SORTING') },
        { value: 'ASC', viewValue: this.translate.instant('FILTER_ASCENDING') },
        { value: 'DESC', viewValue: this.translate.instant('FILTER_DESCENDING') }
      ]},
      { label: this.translate.instant('FILTER_SEATS_SORT'), formControlName: 'seatsNumbSortOrder', type: 'select', options: [
        { value: '', viewValue: this.translate.instant('FILTER_SORTING') },
        { value: 'ASC', viewValue: this.translate.instant('FILTER_ASCENDING') },
        { value: 'DESC', viewValue: this.translate.instant('FILTER_DESCENDING') }
      ]}
    ];
  }

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
    this.arenaService.deleteArena(id).subscribe(
      () => {
        this.translate.get('ARENA_DELETE_SUCCESS').subscribe((message) => {
          this.snackBar.open(message, this.translate.instant('CLOSE'), {
            duration: 3000,
            panelClass: 'snackbar-success',
          });
        });
        this.loadArenas();
      },
      (error) => {
        this.translate.get('ARENA_DELETE_FAILURE').subscribe((message) => {
          this.snackBar.open(message, this.translate.instant('CLOSE'), {
            duration: 3000,
            panelClass: 'snackbar-error',
          });
        });
        console.error('Error deleting arena:', error);
      }
    );
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