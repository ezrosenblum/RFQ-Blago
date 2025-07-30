import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from './header/header';
import { Footer } from './footer/footer';
import { LoadingSpinner } from './loading-spinner/loading-spinner';
import { RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';



@NgModule({
  declarations: [
    Header,
    Footer,
    LoadingSpinner
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatTooltipModule
  ],
  exports: [
    Header,
    Footer,
    LoadingSpinner
  ]
})
export class SharedModule { }
