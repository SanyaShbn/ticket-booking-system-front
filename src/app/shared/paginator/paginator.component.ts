import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    FormsModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class PaginatorComponent {
  @Input() page: number = 0;
  @Input() size: number = 10;
  @Input() totalElements: number = 0;
  @Output() pageChange = new EventEmitter<number>();
  @Output() sizeChange = new EventEmitter<number>();

  math = Math;

  onPageChange(newPage: number): void {
    this.page = newPage;
    this.pageChange.emit(this.page);
  }

  onSizeChange(newSize: number): void {
    this.size = newSize;
    this.sizeChange.emit(this.size);
  }

  nextPage(): void {
    if (this.page < Math.ceil(this.totalElements / this.size) - 1) {
      this.onPageChange(this.page + 1);
    }
  }

  previousPage(): void {
    if (this.page > 0) {
      this.onPageChange(this.page - 1);
    }
  }
}