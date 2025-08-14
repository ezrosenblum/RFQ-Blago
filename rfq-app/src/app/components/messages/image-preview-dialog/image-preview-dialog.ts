import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-image-preview-dialog',
  standalone: false,
  templateUrl: './image-preview-dialog.html',
  styleUrl: './image-preview-dialog.scss'
})
export class ImagePreviewDialog {

  imageUrl!: string;

  constructor(
    private _dialogRef: MatDialogRef<ImagePreviewDialog>, 
    @Inject(MAT_DIALOG_DATA) public _data: any,
  ){
    this.imageUrl = _data.url;
  }

  closeDialog() {
    this._dialogRef.close();
  }
}
