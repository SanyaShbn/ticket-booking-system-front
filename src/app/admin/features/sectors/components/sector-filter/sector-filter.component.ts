import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

@Component({
  selector: 'app-sector-filter',
  templateUrl: './sector-filter.component.html',
  styleUrls: ['./sector-filter.component.scss'],
  imports: [
    ReactiveFormsModule,
    NgIf,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatOptionModule
  ]
})
export class SectorFilterComponent {
  filterForm: FormGroup;
  showFilterForm: boolean = false;

  @Output() filterChanged = new EventEmitter<any>();

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      nameSortOrder: [''],
      maxRowsNumbSortOrder: [''],
      maxSeatsNumbSortOrder: [''],
    });
  }

  applyFilter(): void {
    this.filterChanged.emit(this.filterForm.value);
  }

  resetFilter(): void {
    this.filterForm.reset({
      nameSortOrder: '',
      maxRowsNumbSortOrder: '',
      maxSeatsNumbSortOrder: ''
    });
    this.applyFilter();
  }

  toggleFilterForm(): void {
    this.showFilterForm = !this.showFilterForm;
  }
}
