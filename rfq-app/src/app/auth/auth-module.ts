// src/app/auth/auth.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { Login } from './login/login';
import { Signup} from './signup/signup';
import { AuthRoutingModule } from './auth-routing-module';
import { ResetPasswordComponent } from './reset-password/reset-password';

@NgModule({
  declarations: [
    Login,
    Signup,
    ResetPasswordComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AuthRoutingModule
  ]
})
export class AuthModule { }
