import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ArenaService } from '../../services/arena.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Arena } from '../../models/arena.model';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-arena-form',
  templateUrl: './arena-form.component.html',
  styleUrls: ['./arena-form.component.scss'],
  standalone: true,
  imports: [
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatButtonModule,
    ReactiveFormsModule,
    NgIf,
    HttpClientModule,
    MatSnackBarModule,
    TranslateModule
  ]
})
export class ArenaFormComponent implements OnInit {
  isEditMode = false;
  arenaForm: FormGroup;
  arenaId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private arenaService: ArenaService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {
    this.arenaForm = this.fb.group({
      name: ['', Validators.required],
      city: ['', Validators.required],
      capacity: [0, [Validators.required, Validators.min(1), Validators.max(22000)]]
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.isEditMode = !!id;
      if (id) {
        this.arenaId = +id;
        this.arenaService.getArena(this.arenaId).subscribe(arena => {
          this.arenaForm.patchValue(arena);
        });
      }
    });
  }

  onSubmit(): void {
    if (this.arenaForm.valid) {
      const arena: Arena = this.arenaForm.value;
      if (this.arenaId) {
        this.arenaService.updateArena(this.arenaId, arena).subscribe({
          next: () => {
            this.translate.get('ARENA_UPDATE_SUCCESS').subscribe((message) => {
              this.snackBar.open(message, this.translate.instant('CLOSE'), {
                duration: 3000,
              });
            });
            this.router.navigate(['/admin/arenas']);
          },
          error: (err) => {
            const errorMessage =
            err?.error?.message || this.translate.instant('ARENA_UPDATE_FAILURE');
            this.snackBar.open(errorMessage, this.translate.instant('CLOSE'), {
              duration: 3000,
              panelClass: 'snackbar-error',
            });
          },
        });
      } else {
        this.arenaService.createArena(arena).subscribe({
          next: () => {
            this.translate.get('ARENA_CREATE_SUCCESS').subscribe((message) => {
              this.snackBar.open(message, this.translate.instant('CLOSE'), {
                duration: 3000,
              });
            });
            this.router.navigate(['/admin/arenas']);
          },
          error: (err) => {
            const errorMessage =
            err?.error?.message || this.translate.instant('ARENA_CREATE_FAILURE');
            this.snackBar.open(errorMessage, this.translate.instant('CLOSE'), {
              duration: 3000,
              panelClass: 'snackbar-error',
            });
          },
        });
      }
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/arenas']);
  }
}