import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-image-dialog',
  template: `
    <div class="image-dialog">
      <img [src]="data.imageUrl" alt="Image" class="image">
    </div>
  `,
  styles: [`
    .image-dialog {
      text-align: center;
    }

    .image {
      width: 100%;
      height: 100%;
    }
  `]
})
export class ImageDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { imageUrl: SafeUrl }) { }
}