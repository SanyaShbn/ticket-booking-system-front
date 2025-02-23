import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

export interface FilterConfig {
  label: string;
  formControlName: string;
  type: 'input' | 'select';
  options?: { value: string; viewValue: string }[];
}

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  imports: [
    ReactiveFormsModule,
    NgIf,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatOptionModule,
    NgFor
  ]
})
export class FilterComponent {
  @Input() filterConfig: FilterConfig[] = [];
  filterForm: FormGroup;
  showFilterForm: boolean = false;

  @Output() filterChanged = new EventEmitter<any>();

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({});
  }

  ngOnChanges(): void {
    this.filterConfig.forEach(config => {
      this.filterForm.addControl(config.formControlName, this.fb.control(''));
    });
  }

  applyFilter(): void {
    this.filterChanged.emit(this.filterForm.value);
  }

  resetFilter(): void {
    this.filterForm.reset(this.filterConfig.reduce((acc, config) => ({ ...acc, [config.formControlName]: '' }), {}));
    this.applyFilter();
  }

  toggleFilterForm(): void {
    this.showFilterForm = !this.showFilterForm;
  }
}