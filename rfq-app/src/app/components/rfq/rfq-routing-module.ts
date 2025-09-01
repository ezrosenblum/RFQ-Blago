import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RequestQuote } from './request-quote/request-quote';
import { VendorRfqs } from './vendor-rfqs/vendor-rfqs';
import { RfqDetails } from './rfq-details/rfq-details';
import { AuthGuard } from '../../guards/auth-guard';
import { MyQuotesComponent } from './my-quotes/my-quotes';
import { QuoteDetails } from './quote-details/quote-details';

const routes: Routes = [
  { path: '', redirectTo: 'request-quote', pathMatch: 'full' },
  { path: 'request-quote', component: RequestQuote },
  { path: 'request-quote/:id', component: RequestQuote, canActivate: [AuthGuard] },
  { path: 'vendor-rfqs', component: VendorRfqs, canActivate: [AuthGuard] },
  { path: 'vendor-rfqs/:id', component: RfqDetails, canActivate: [AuthGuard] },
  { path: 'my-quotes', component: MyQuotesComponent, canActivate: [AuthGuard] },
  { path: 'quote-details/:id', component: QuoteDetails, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RfqRoutingModule {}
