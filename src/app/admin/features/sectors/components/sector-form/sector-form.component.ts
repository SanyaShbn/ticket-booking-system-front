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
    MatCardModule
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
    private route: ActivatedRoute
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
      this.sectorService.updateSector(this.arenaId, this.sectorId, sector).subscribe(() => {
        this.router.navigate(['/admin/sectors/list'], { queryParams: { arenaId: this.arenaId } });
      });
    } else {
      this.sectorService.createSector(this.arenaId, sector).subscribe(() => {
        this.router.navigate(['/admin/sectors/list'], { queryParams: { arenaId: this.arenaId } });
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/sectors/list'], { queryParams: { arenaId: this.arenaId } });
  }
}