import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { SportEventService } from '../../services/sport-event.service';
import { SportEvent } from '../../models/sport-event.model';
import { Router } from '@angular/router';
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
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { FilterConfig, FilterComponent } from '../../../../../shared/filter/filter.component';
import { MatDialog } from '@angular/material/dialog'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';
import { catchError, switchMap  } from 'rxjs/operators';
import { ImageDialogComponent } from '../image-dialog/image-dialog.component';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-sport-event-list',
  templateUrl: './sport-event-list.component.html',
  styleUrls: ['./sport-event-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatSortModule,
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
    MatSnackBarModule
  ]
})
export class SportEventListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['eventName', 'eventDateTime', 'arena', 'posterImage', 'actions'];
  dataSource = new MatTableDataSource<any>();
  page: number = 0;
  size: number = 10;
  totalElements: number = 0;
  isLoading: boolean = true;
  imageCache: { [key: string]: Observable<SafeUrl | null> } = {};
  viewMode: 'list' | 'gallery' = 'list';

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
    private sanitizer: DomSanitizer,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => {
      this.page = 0;
      this.loadSportEvents();
    });
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

  addSportEvent(): void {
    this.router.navigate(['/admin/sport-events/new']);
  }

  editSportEvent(sportEvent: SportEvent): void {
    this.router.navigate(['/admin/sport-events/edit', sportEvent.id]);
  }

  deleteSportEvent(id: number): void {
    this.sportEventService.deleteSportEvent(id).subscribe(() => {
      this.snackBar.open('Sport event deleted successfully', 'Close', {
        duration: 3000
      });
      this.loadSportEvents();
    });
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

  downloadImage(imagePath: string): void {
   this.sportEventService.getPosterImage(imagePath).forEach((data: Blob) => {
     const blob = new Blob([data], { type: data.type });
     saveAs(blob, imagePath.split('/').pop() || 'downloaded_image.jpg');
   }).catch(error => {
     console.error('Failed to download image:', error);
   });
 }

  toggleViewMode(event: MatButtonToggleChange): void {
    this.viewMode = event.value as 'list' | 'gallery';
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