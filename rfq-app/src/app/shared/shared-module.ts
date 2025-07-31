import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from './header/header';
import { Footer } from './footer/footer';
import { LoadingSpinner } from './loading-spinner/loading-spinner';
import { RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [
    Header,
    Footer,
    LoadingSpinner
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatTooltipModule,
    TranslateModule
  ],
  exports: [
    Header,
    Footer,
    LoadingSpinner
  ]
})
export class SharedModule { }
