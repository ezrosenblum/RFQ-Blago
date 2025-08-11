import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RfqRoutingModule } from './rfq-routing-module';
import { RequestQuote } from './request-quote/request-quote';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VendorRfqs } from './vendor-rfqs/vendor-rfqs';
import { FilePondModule } from 'ngx-filepond';
import { TranslateModule } from '@ngx-translate/core';
import { FileViewComponent } from "../../shared/file-view/file-view.component";
import { RfqDetails } from './rfq-details/rfq-details';
import { MaterialCategoriesSelectionComponent } from '../profile/material-categories-selection/material-categories-selection.component';


@NgModule({
  declarations: [
    RequestQuote,
    VendorRfqs,
    RfqDetails
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RfqRoutingModule,
    FilePondModule,
    TranslateModule,
    FileViewComponent,
    MaterialCategoriesSelectionComponent
  ]
})

export class RfqModule { }
