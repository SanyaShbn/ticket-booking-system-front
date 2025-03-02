import { Component, OnInit, Inject  } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SportEventService } from '../../services/sport-event.service';
import { ArenaService } from '../../../arenas/services/arena.service';
import { SportEvent } from '../../models/sport-event.model';
import { Arena } from '../../../arenas/models/arena.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { startWith, map, switchMap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-sport-event-form',
  templateUrl: './sport-event-form.component.html',
  styleUrls: ['./sport-event-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatAutocompleteModule,
    MatDialogModule
  ]
})
export class SportEventFormComponent implements OnInit {
  eventForm!: FormGroup;
  isEditMode = false;
  eventId!: number;
  arenaId!: number;
  arenas$: Observable<Arena[]> | undefined;
  selectedArena: Arena | null = null;
  posterImage$: Observable<SafeUrl | null> | undefined;
  page: number = 0;
  totalPages: number = 0;

  constructor(
    private fb: FormBuilder,
    private sportEventService: SportEventService,
    private arenaService: ArenaService,
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.eventForm = this.fb.group({
      eventName: ['', Validators.required],
      eventDateTime: ['', Validators.required],
      arena: ['', Validators.required],
      posterImage: [null]
    });

    this.route.queryParams.subscribe(params => {
      this.arenaId = +params['arenaId'] || 0;
    });

    this.route.params.subscribe(params => {
      this.eventId = +params['id'] || 0;
      this.isEditMode = !!this.eventId;
      if (this.isEditMode) {
        this.loadEvent();
      }
    });

    const arenaControl = this.eventForm.get('arena');
    if (arenaControl) {
      this.arenas$ = arenaControl.valueChanges.pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(value => 
          typeof value === 'string'
            ? this.arenaService.getArenasForSportEvents(this.page, 5).pipe(
                map(response => {
                  this.totalPages = response.totalPages;
                  return response.content.filter((arena: Arena) => 
                    arena.name.toLowerCase().includes(value.toLowerCase())
                  );
                })
              )
            : this.arenaService.getArenasForSportEvents(this.page, 5).pipe(
                map(response => {
                  this.totalPages = response.totalPages;
                  return response.content;
                })
              )
        )
      );
    }
  }

  loadEvent(): void {
    this.sportEventService.getSportEvent(this.eventId).subscribe(event => {
      this.eventForm.patchValue(event);
      this.arenaId = this.isEditMode ? this.eventForm.value.arena.id : event.arenaId;
      if (event.posterImage) {
        this.posterImage$ = this.sportEventService.getPosterImage(event.posterImage).pipe(
          switchMap((data: Blob) => data.arrayBuffer().then(buffer => ({
            buffer,
            type: data.type
          }))),
          map(({ buffer, type }) => {
            const objectURL = URL.createObjectURL(new Blob([buffer], { type }));
            return this.sanitizer.bypassSecurityTrustUrl(objectURL);
          })
        );
      }
    });
  }

  onSubmit(): void {
    if (this.eventForm.invalid) {
      return;
    }

    const formValue = this.eventForm.value;
    const file: File | null = formValue.posterImage instanceof File ? formValue.posterImage : null;

    const eventDateTime = typeof formValue.eventDateTime === 'string'
        ? new Date(formValue.eventDateTime)
        : formValue.eventDateTime;

    const event: SportEvent = {
      ...formValue,
      arenaId: this.selectedArena?.id || 0,
      posterImage: file,
      eventDateTime
    };

    if (this.isEditMode) {
      this.sportEventService.updateSportEvent(this.arenaId, this.eventId, event).subscribe(() => {
        this.router.navigate(['/admin/sport-events']);
    });
    } else {
      this.sportEventService.createSportEvent(this.arenaId, event).subscribe(() => {
        this.router.navigate(['/admin/sport-events']);
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/sport-events']);
  }

  displayArenaFn(arena: Arena): string {
    return arena && arena.name ? arena.name : '';
  }
  
  onFileChange(event: any): void {
    const file = event.target.files[0];
    this.eventForm.patchValue({ posterImage: file })

    const fileNameSpan = event.target.nextElementSibling.nextElementSibling;
    if (fileNameSpan && file) {
      fileNameSpan.textContent = file.name;
    }
  }

  onArenaSelected(selectedArena: Arena): void {
    this.selectedArena = selectedArena;
    this.arenaId = selectedArena.id;
  }

  confirmDeletePoster(): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '250px',
      data: { message: 'Are you sure you want to delete the poster image?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deletePosterImage();
      }
    });
  }

  deletePosterImage(): void {
    if (this.eventId && this.isEditMode) {
      this.sportEventService.getSportEvent(this.eventId).subscribe(event => {
        if (event.posterImage) {
          this.sportEventService.deletePosterImage(event.posterImage).subscribe(() => {
            this.posterImage$ = undefined;
            this.eventForm.patchValue({ posterImage: null });
          });
        }
      });
    }
  }

  // onPageChange(newPage: number): void {
  //   this.page = newPage;
  //   this.arenas$ = this.eventForm.get('arena')!.valueChanges.pipe(
  //     startWith(''),
  //     debounceTime(300),
  //     distinctUntilChanged(),
  //     switchMap(value => 
  //       typeof value === 'string'
  //       ? this.arenaService.getArenasForSportEvents(this.page, 5).pipe(
  //           map(arenas => arenas.filter((arena: Arena) => 
  //             arena.name.toLowerCase().includes(value.toLowerCase())
  //           ))
  //         )
  //       : this.arenaService.getArenasForSportEvents(this.page, 5)
  //     )
  //   );
  // }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.page = newPage;

      this.arenas$ = this.arenaService.getArenasForSportEvents(this.page, 5).pipe(
        map(response => {
          this.totalPages = response.totalPages;
          return response.content;
        })
      );

      const arenaControl = this.eventForm.get('arena');
      if (arenaControl) {
        arenaControl.setValue(arenaControl.value);
      }
    }
  }  

}

// Компонент подтверждающего диалога
@Component({
  selector: 'confirm-dialog',
  imports: [
    MatButtonModule,
    MatDialogModule
  ],
  template: `
    <h1 mat-dialog-title>Confirmation</h1>
    <div mat-dialog-content>{{data.message}}</div>
    <div mat-dialog-actions>
      <button mat-button (click)="onNoClick()">No</button>
      <button mat-button [mat-dialog-close]="true" cdkFocusInitial>Yes</button>
    </div>
  `,
})
export class ConfirmDialog {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}

interface DialogData {
  message: string;
}