import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';

import { RfqRoutingModule } from './rfq-routing-module';
import { RequestQuote } from './request-quote/request-quote';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VendorRfqs } from './vendor-rfqs/vendor-rfqs';
import { FilePondModule } from 'ngx-filepond';
import { TranslateModule } from '@ngx-translate/core';
import { FileViewComponent } from "../../shared/file-view/file-view.component";
import { RfqDetails } from './rfq-details/rfq-details';
import { MaterialCategoriesSelectionComponent } from '../profile/material-categories-selection/material-categories-selection.component';
import { QuoteFormDialog } from './vendor-rfqs/quote-form-dialog/quote-form-dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MyQuotesComponent } from './my-quotes/my-quotes';
import { MatTooltipModule } from '@angular/material/tooltip';
import { QuoteSendMessageDialog } from './quote-send-message-dialog/quote-send-message-dialog';
import { QuoteDetails } from './quote-details/quote-details';
import { QuillModule } from 'ngx-quill';
import { ApprovedQuoteDetails } from './approved-quote-details/approved-quote-details';

@NgModule({
  declarations: [
    RequestQuote,
    VendorRfqs,
    RfqDetails,
    QuoteFormDialog,
    MyQuotesComponent,
    QuoteSendMessageDialog,
    QuoteDetails,
    ApprovedQuoteDetails
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RfqRoutingModule,
    FilePondModule,
    TranslateModule,
    FileViewComponent,
    MaterialCategoriesSelectionComponent,
    MatDialogModule,
    MatTooltipModule,
    QuillModule
  ],
  providers: [
    CurrencyPipe 
  ]
})

export class RfqModule { }
