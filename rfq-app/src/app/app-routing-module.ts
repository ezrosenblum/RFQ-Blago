// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard';
import { AuthModule } from './auth/auth-module';
import { VendorRfqs } from './rfq/vendor-rfqs/vendor-rfqs';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/request-quote',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth-module').then(m => m.AuthModule)
  },
  {
    path: 'request-quote',
    loadChildren: () => import('./rfq/rfq-module').then(m => m.RfqModule)
  },
  {
    path: 'vendor-rfqs',
    component: VendorRfqs,
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '/request-quote'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    enableTracing: false, // Set to true for debugging
    scrollPositionRestoration: 'top',
    anchorScrolling: 'enabled',
    scrollOffset: [0, 64]
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
