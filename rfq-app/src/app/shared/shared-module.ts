import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from './header/header';
import { Footer } from './footer/footer';
import { LoadingSpinner } from './loading-spinner/loading-spinner';
import { RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { PhoneInputComponent } from './phone-input/phone-input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { PieChartComponent } from './pie-chart/pie-chart';
import { LineChartComponent } from './line-chart/line-chart';


@NgModule({
  declarations: [
    Header,
    Footer,
    LoadingSpinner,
    PhoneInputComponent,
    PieChartComponent,
    LineChartComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule, 
    FormsModule,
    RouterModule,
    MatTooltipModule,
    TranslateModule,
    NgxIntlTelInputModule,
    MatMenuModule,
  ],
  exports: [
    Header,
    Footer,
    LoadingSpinner,
    PhoneInputComponent,
    PieChartComponent,
    LineChartComponent,
    MatTooltipModule,
  ],
})
export class SharedModule { }
