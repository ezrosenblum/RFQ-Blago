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

@NgModule({
  declarations: [
    MessagesComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FilePondModule,
    TranslateModule.forChild(),
    MatTooltipModule,
    MatMenuModule,
    MatIconModule,
    MatDialogModule
  ]
})
export class MessagesModule { }