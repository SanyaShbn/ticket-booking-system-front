import { Component, OnInit } from '@angular/core';
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
import { startWith, map, switchMap } from 'rxjs/operators';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

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
    MatAutocompleteModule
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

  constructor(
    private fb: FormBuilder,
    private sportEventService: SportEventService,
    private arenaService: ArenaService,
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
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

    this.arenas$ = this.eventForm.get('arena')!.valueChanges.pipe(
      startWith(''),
      switchMap(() => this.arenaService.getArenasForSportEvents(0, 10).pipe(
        map(response => response.content)
      ))
    );
  }

  loadEvent(): void {
    this.sportEventService.getSportEvent(this.eventId).subscribe(event => {
      this.eventForm.patchValue(event);
      // this.arenaId = event.arenaId;
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
  }

  onArenaSelected(selectedArena: Arena): void {
    this.selectedArena = selectedArena;
    this.arenaId = selectedArena.id;
  }

}