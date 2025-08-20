// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard';
import { MessagesComponent } from './components/messages/messages';
import { ChartDemoComponent } from './components/chart-demo/chart-demo';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./components/rfq/rfq-module').then(m => m.RfqModule),
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth-module').then((m) => m.AuthModule),
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./components/profile/profile-module').then((m) => m.ProfileModule),
  },
   {
    path: 'messages',
    component: MessagesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'chart-demo',
    component: ChartDemoComponent
  },
  {
    path: '**',
    redirectTo: '/request-quote',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      enableTracing: false, // Set to true for debugging
      scrollPositionRestoration: 'top',
      anchorScrolling: 'enabled',
      scrollOffset: [0, 64],
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
