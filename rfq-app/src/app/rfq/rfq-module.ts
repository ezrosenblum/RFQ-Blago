import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RfqRoutingModule } from './rfq-routing-module';
import { RequestQuote } from './request-quote/request-quote';
import { VendorRfqs } from './vendor-rfqs/vendor-rfqs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    RequestQuote,
    VendorRfqs
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RfqRoutingModule
  ]
})
export class RfqModule { }
