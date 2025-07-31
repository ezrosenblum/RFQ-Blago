import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FilePondModule } from 'ngx-filepond';
import { TranslateModule } from '@ngx-translate/core';
import { MessagesComponent } from './messages';

@NgModule({
  declarations: [
    MessagesComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FilePondModule,
    TranslateModule
  ]
})
export class MessagesModule { }