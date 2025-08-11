import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RequestQuote } from './request-quote/request-quote';
import { VendorRfqs } from './vendor-rfqs/vendor-rfqs';
import { RfqDetails } from './rfq-details/rfq-details';
import { AuthGuard } from '../../guards/auth-guard';

const routes: Routes = [
  { path: '', redirectTo: 'request-quote', pathMatch: 'full' },
  { path: 'request-quote', component: RequestQuote },
  { path: 'vendor-rfqs', component: VendorRfqs, canActivate: [AuthGuard] },
  { path: 'vendor-rfqs/:id', component: RfqDetails, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RfqRoutingModule { }


