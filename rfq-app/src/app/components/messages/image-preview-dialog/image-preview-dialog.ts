import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-image-preview-dialog',
  standalone: false,
  templateUrl: './image-preview-dialog.html',
  styleUrl: './image-preview-dialog.scss'
})
export class ImagePreviewDialog implements OnInit {

  imageUrl!: string;
  format!: string;
  textContent!: string;

  constructor(
    private sanitizer: DomSanitizer,
    private _dialogRef: MatDialogRef<ImagePreviewDialog>, 
    @Inject(MAT_DIALOG_DATA) public _data: any,
  ){
    this.imageUrl = _data.url;
    this.format = _data.format;
  }

  ngOnInit(): void {
    if (this.format === '.txt') {
      fetch(this.imageUrl)
        .then(res => res.text())
        .then(text => this.textContent = text)
        .catch(error => {
          this.textContent = 'Failed to load file.';
        });
      }
  }

  closeDialog() {
    this._dialogRef.close();
  }

    transform(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
