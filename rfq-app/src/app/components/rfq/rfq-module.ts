import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RfqRoutingModule } from './rfq-routing-module';
import { RequestQuote } from './request-quote/request-quote';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VendorRfqs } from './vendor-rfqs/vendor-rfqs';
import { FilePondModule } from 'ngx-filepond';
import { TranslateModule } from '@ngx-translate/core';
import { FileViewComponent } from "../../shared/file-view/file-view.component";


@NgModule({
  declarations: [
    RequestQuote,
    VendorRfqs
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RfqRoutingModule,
    FilePondModule,
    TranslateModule,
    FileViewComponent
  ]
})

export class RfqModule { }
