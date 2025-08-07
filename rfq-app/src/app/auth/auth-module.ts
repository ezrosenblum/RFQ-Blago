// src/app/auth/auth.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { Login } from './login/login';
import { Signup} from './signup/signup';
import { AuthRoutingModule } from './auth-routing-module';
import { ResetPasswordComponent } from './reset-password/reset-password';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { VerifyComponent } from './verify/verify.component';
import { TranslateModule  } from '@ngx-translate/core';
import { ServiceAreasComponent } from "../components/profile/service-areas/service-areas.component";

@NgModule({
  declarations: [
    Login,
    Signup,
    ResetPasswordComponent,
    ForgotPasswordComponent,
    VerifyComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AuthRoutingModule,
    TranslateModule,
    ServiceAreasComponent
]
})
export class AuthModule { }
