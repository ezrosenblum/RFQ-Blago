import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RequestQuote } from './request-quote/request-quote';
import { VendorRfqs } from './vendor-rfqs/vendor-rfqs';

const routes: Routes = [
  {
    path: '',
    component: RequestQuote
  },
  {
    path: 'vendor-rfqs',
    component: VendorRfqs
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RfqRoutingModule { }


