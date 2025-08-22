import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FilePondModule } from 'ngx-filepond';
import { TranslateModule } from '@ngx-translate/core';
import { MessagesComponent } from './messages';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AsyncPipe } from '@angular/common';
import { ImagePreviewDialog } from './image-preview-dialog/image-preview-dialog';
import { RouterModule } from '@angular/router';
import { FileViewComponent } from '../../shared/file-view/file-view.component';

@NgModule({
  declarations: [
    MessagesComponent,
    ImagePreviewDialog
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FilePondModule,
    TranslateModule,
    MatTooltipModule,
    MatMenuModule,
    MatIconModule,
    MatDialogModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    AsyncPipe,
    RouterModule,
    FileViewComponent
  ]
})
export class MessagesModule { }