import { Component, OnInit, ViewChild, AfterViewInit, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { SportEventService } from '../../services/sport-event.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { PaginatorComponent } from '../../../../../shared/paginator/paginator.component';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { NgIf } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FilterConfig, FilterComponent } from '../../../../../shared/filter/filter.component';
import { MatDialog } from '@angular/material/dialog'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';
import { catchError, switchMap  } from 'rxjs/operators';
import { ImageDialogComponent } from '../image-dialog/image-dialog.component'
import { TopBarComponent } from '../../../../../shared/top-bar/top-bar.component';

@Component({
  selector: 'app-sport-event-selection',
  templateUrl: './sport-event-selection.component.html',
  styleUrl: './sport-event-selection.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FilterComponent,
    PaginatorComponent,
    MatTableModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    NgIf,
    MatProgressSpinnerModule,
    MatButtonToggleModule,
    MatCardModule,
    TopBarComponent
  ]
})

export class SportEventSelectionComponent implements OnInit, AfterViewInit {
  @Input() navigateTo: string = '/admin/tickets/list';
  @Input() showTopBar: boolean = true;

  dataSource = new MatTableDataSource<any>();
  page: number = 0;
  size: number = 10;
  totalElements: number = 0;
  isLoading: boolean = true;
  imageCache: { [key: string]: Observable<SafeUrl | null> } = {};

  @ViewChild(MatSort) sort!: MatSort;

  filterConfig: FilterConfig[] = [
    { label: 'Start Date', formControlName: 'startDate', type: 'date' },
    { label: 'End Date', formControlName: 'endDate', type: 'date' },
    { label: 'Arena', formControlName: 'arenaName', type: 'input' },
    { label: 'Date Sort Order', formControlName: 'sortOrder', type: 'select', options: [
      { value: '', viewValue: '-- Sorting --' },
      { value: 'ASC', viewValue: 'Ascending' },
      { value: 'DESC', viewValue: 'Descending' }
    ]}
  ];

  filters = {
    startDate: '',
    endDate: '',
    arenaName: '',
    sortOrder: ''
  };

  constructor(
    private sportEventService: SportEventService, 
    private router: Router, 
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.navigateTo = data['navigateTo'] || this.navigateTo;
      this.showTopBar = data['showTopBar'] !== false;
    });
  }

  ngAfterViewInit(): void {
    if (this.sort) {
      this.sort.sortChange.subscribe(() => {
        this.page = 0;
        this.loadSportEvents();
      });
    }
    this.loadSportEvents();
  }  

  loadSportEvents(): void {
    this.isLoading = true;

    const startDate = this.filters.startDate ? new Date(this.filters.startDate) : null;
    const endDate = this.filters.endDate ? new Date(this.filters.endDate) : null;

    this.sportEventService.getSportEvents(
      startDate,
      endDate,
      this.filters.arenaName,
      this.filters.sortOrder,
      this.page,
      this.size
    ).subscribe(data => {
      this.dataSource.data = data.content.map((event: any) => ({
      ...event,
      arenaName: event.arena?.name || 'Unknown'
      }));
      this.totalElements = data.metadata.totalElements;
      this.isLoading = false;
    });
  }

  onFilterChanged(filters: any): void {
    this.filters = filters;
    this.page = 0;
    this.loadSportEvents();
  }

  getPosterImage(filename?: string): Observable<SafeUrl | null> {
    if (!filename?.trim()) {
      return of(null);
    }
    if (this.imageCache[filename]) {
        return this.imageCache[filename];
    }
    this.imageCache[filename] = this.sportEventService.getPosterImage(filename).pipe(
        switchMap(data => {
          const contentType = data.type;
          return data.arrayBuffer().then(buffer => {
              const objectURL = URL.createObjectURL(new Blob([buffer], { type: contentType }));
              return this.sanitizer.bypassSecurityTrustUrl(objectURL);
          });
        }),
        catchError(() => {
            console.error(`Error loading poster image for file ${filename}`);
            return of(null);
        })
    );
    return this.imageCache[filename];
 }
 
  selectSportEvent(eventId: number): void {
    this.router.navigate([this.navigateTo], { queryParams: { eventId: eventId } });
  }

  onPageChange(newPage: number): void {
    this.page = newPage;
    this.loadSportEvents();
  }

  onSizeChange(newSize: number): void {
    this.size = newSize;
    this.page = 0;
    this.loadSportEvents();
  }

  openImageDialog(imageUrl: SafeUrl): void {
    this.dialog.open(ImageDialogComponent, {
      data: { imageUrl }
    });
  }
}
