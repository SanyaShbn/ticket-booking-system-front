import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { RowService } from '../../services/row.service';
import { Row } from '../../models/row.model';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { PaginatorComponent } from '../../../../../shared/paginator/paginator.component';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FilterConfig, FilterComponent } from '../../../../../shared/filter/filter.component'; 
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-row-list',
  templateUrl: './row-list.component.html',
  styleUrls: ['./row-list.component.scss'],
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
    MatSnackBarModule,
    TranslateModule
  ]
})
export class RowListComponent implements OnInit {
  displayedColumns: string[] = ['rowNumber', 'seatsNumb', 'actions'];
  dataSource = new MatTableDataSource<Row>();
  page: number = 0;
  size: number = 10;
  totalElements: number = 0;
  sectorId!: number;
  arenaId!: number;
  isLoading: boolean = true;

  @ViewChild(MatSort) sort!: MatSort;

  filters = {
    rowNumberOrder: '',
    seatsNumbOrder: ''
  };

  filterConfig: FilterConfig[] = [];
  private langChangeSubscription!: Subscription;

  constructor(
    private rowService: RowService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.updateFilterConfig();
    
    this.langChangeSubscription = this.translate.onLangChange.subscribe(() => {
      this.updateFilterConfig();
    });

    this.route.queryParams.subscribe(params => {
      this.sectorId = +params['sectorId'] || 0;
      this.arenaId = +params['arenaId'] || 0;
      this.loadRows();
    });
  }

  ngOnDestroy(): void {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }

  updateFilterConfig(): void {
    this.filterConfig = [
      { label: this.translate.instant('FILTER_ROW_SORT'), formControlName: 'rowNumberOrder', type: 'select', options: [
        { value: '', viewValue: this.translate.instant('FILTER_SORTING') },
        { value: 'ASC', viewValue: this.translate.instant('FILTER_ASCENDING') },
        { value: 'DESC', viewValue: this.translate.instant('FILTER_DESCENDING') }
      ]},
      { label: this.translate.instant('FILTER_SEATS_SORT'), formControlName: 'seatsNumbOrder', type: 'select', options: [
        { value: '', viewValue: this.translate.instant('FILTER_SORTING') },
        { value: 'ASC', viewValue: this.translate.instant('FILTER_ASCENDING') },
        { value: 'DESC', viewValue: this.translate.instant('FILTER_DESCENDING') }
      ]}
    ];
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => {
      this.page = 0;
      this.loadRows();
    });
  }

  async loadRows() {
    this.isLoading = true;
    this.rowService.getRows(
      this.sectorId,
      this.filters.rowNumberOrder,
      this.filters.seatsNumbOrder,
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
    this.loadRows();
  }

  addRow(): void {
    this.router.navigate(['/admin/rows/list/new'], { queryParams: { sectorId: this.sectorId, arenaId: this.arenaId } });
  }

  editRow(row: Row): void {
    this.router.navigate(['/admin/rows/list/edit', row.id], { queryParams: { sectorId: this.sectorId, arenaId: this.arenaId } });
  }

  deleteRow(id: number): void {
    this.rowService.deleteRow(id).subscribe(
      () => {
        this.translate.get('ROW_DELETE_SUCCESS').subscribe((message) => {
          this.snackBar.open(message, this.translate.instant('CLOSE'), {
            duration: 3000,
          });
        });
        this.loadRows();
      },
      (error) => {
        this.translate.get('ROW_DELETE_FAILURE').subscribe((message) => {
          this.snackBar.open(message, this.translate.instant('CLOSE'), {
            duration: 3000,
            panelClass: 'snackbar-error',
          });
        });
        console.error('Error deleting row:', error);
      }
    );
  }

  goBack(): void {
    this.router.navigate(['/admin/rows/sector-select'], { queryParams: { arenaId: this.arenaId } });
  }  

  onPageChange(newPage: number): void {
    this.page = newPage;
    this.loadRows();
  }

  onSizeChange(newSize: number): void {
    this.size = newSize;
    this.page = 0;
    this.loadRows();
  }
}