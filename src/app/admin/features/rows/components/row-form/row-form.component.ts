import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RowService } from '../../services/row.service';
import { Row } from '../../models/row.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-row-form',
  templateUrl: './row-form.component.html',
  styleUrls: ['./row-form.component.scss'],
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
export class RowFormComponent implements OnInit {
  rowForm!: FormGroup;
  isEditMode = false;
  rowId!: number;
  sectorId!: number;
  arenaId!: number;

  constructor(
    private fb: FormBuilder,
    private rowService: RowService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.rowForm = this.fb.group({
      rowNumber: ['', [Validators.required, Validators.min(1)]],
      seatsNumb: ['', [Validators.required, Validators.min(1)]]
    });

    this.route.queryParams.subscribe(params => {
      this.sectorId = +params['sectorId'] || 0;
      this.arenaId = +params['arenaId'] || 0;
    });

    this.route.params.subscribe(params => {
      this.rowId = +params['id'] || 0;
      this.isEditMode = !!this.rowId;
      if (this.isEditMode) {
        this.loadRow();
      }
    });
  }

  loadRow(): void {
    this.rowService.getRow(this.rowId).subscribe(row => {
      this.rowForm.patchValue(row);
    });
  }

  onSubmit(): void {
    if (this.rowForm.invalid) {
      return;
    }

    const row: Row = {
      ...this.rowForm.value,
      sectorId: this.sectorId
    };

    if (this.isEditMode) {
      this.rowService.updateRow(this.sectorId, this.rowId, row).subscribe(() => {
        this.router.navigate(['/admin/rows/list'], { queryParams: { sectorId: this.sectorId, arenaId: this.arenaId } });
      });
    } else {
      this.rowService.createRow(this.sectorId, row).subscribe(() => {
        this.router.navigate(['/admin/rows/list'], { queryParams: { sectorId: this.sectorId, arenaId: this.arenaId } });
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/rows/list'], { queryParams: { sectorId: this.sectorId, arenaId: this.arenaId } });
  }
}