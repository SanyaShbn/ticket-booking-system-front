import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TranslateModule } from '@ngx-translate/core';

export interface FilterConfig {
  label: string;
  formControlName: string;
  type: 'input' | 'select' | 'date';
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
    NgFor,
    MatDatepickerModule,
    MatNativeDateModule,
    TranslateModule
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
    const rawValues = this.filterForm.value;
    const filteredValues: { [key: string]: any } = Object.keys(rawValues).reduce((acc, key) => {
      if (this.filterConfig.find(config => config.formControlName === key)?.type === 'date' && rawValues[key]) {
        const date = new Date(rawValues[key]);
        const isoString = date.toISOString();
        const formattedDate = isoString.slice(0, 19);
        acc[key] = formattedDate;
      } else {
        acc[key] = rawValues[key];
      }
      return acc;
    }, {} as { [key: string]: any });
  
    this.filterChanged.emit(filteredValues);
  }

  resetFilter(): void {
    this.filterForm.reset(this.filterConfig.reduce((acc, config) => ({ ...acc, [config.formControlName]: '' }), {}));
    this.applyFilter();
  }

  toggleFilterForm(): void {
    this.showFilterForm = !this.showFilterForm;
  }
}