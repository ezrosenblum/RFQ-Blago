import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from './header/header';
import { Footer } from './footer/footer';
import { LoadingSpinner } from './loading-spinner/loading-spinner';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    Header,
    Footer,
    LoadingSpinner
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    Header,
    Footer,
    LoadingSpinner
  ]
})
export class SharedModule { }
