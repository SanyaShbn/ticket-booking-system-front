import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SectorService } from '../../services/sector.service';
import { Sector } from '../../models/sector.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-sector-form',
  templateUrl: './sector-form.component.html',
  styleUrls: ['./sector-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule
  ]
})
export class SectorFormComponent implements OnInit {
  sectorForm!: FormGroup;
  isEditMode = false;
  sectorId!: number;
  arenaId!: number;

  constructor(
    private fb: FormBuilder,
    private sectorService: SectorService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.sectorForm = this.fb.group({
      sectorName: ['', Validators.required],
      maxRowsNumb: ['', [Validators.required, Validators.min(1)]],
      maxSeatsNumb: ['', [Validators.required, Validators.min(1)]]
    });

    this.route.queryParams.subscribe(params => {
      this.arenaId = +params['arenaId'] || 0;
    });

    this.route.params.subscribe(params => {
      this.sectorId = +params['id'] || 0;
      this.isEditMode = !!this.sectorId;
      if (this.isEditMode) {
        this.loadSector();
      }
    });
  }

  loadSector(): void {
    this.sectorService.getSector(this.sectorId).subscribe(sector => {
      this.sectorForm.patchValue(sector);
    });
  }

  onSubmit(): void {
    if (this.sectorForm.invalid) {
      return;
    }

    const sector: Sector = {
      ...this.sectorForm.value,
      arenaId: this.arenaId
    };

    if (this.isEditMode) {
      this.sectorService.updateSector(this.arenaId, this.sectorId, sector).subscribe({
        next: () => {
          this.snackBar.open('Sector updated successfully', 'Close', {
            duration: 3000
          });
          this.router.navigate(['/admin/sectors/list'], { queryParams: { arenaId: this.arenaId } });
        },
        error: (err) => {
          const errorMessage = err?.error?.message || 'Failed to update sector';
          this.snackBar.open(errorMessage, 'Close', {
            duration: 3000,
            panelClass: 'snackbar-error',
          });
        },
      });
    } else {
      this.sectorService.createSector(this.arenaId, sector).subscribe({
        next: () => {
          this.snackBar.open('Sector created successfully', 'Close', {
            duration: 3000
          });
          this.router.navigate(['/admin/sectors/list'], { queryParams: { arenaId: this.arenaId } });
        },
        error: (err) => {
          const errorMessage = err?.error?.message || 'Failed to create sector';
          this.snackBar.open(errorMessage, 'Close', {
            duration: 3000,
            panelClass: 'snackbar-error',
          });
        },
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/sectors/list'], { queryParams: { arenaId: this.arenaId } });
  }
}