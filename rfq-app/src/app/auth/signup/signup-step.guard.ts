// src/app/auth/signup/signup-step.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';

type Step = 'basic' | 'vendor' | 'location';

@Injectable({ providedIn: 'root' })
export class SignupStepGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const qp = route.queryParams || {};
    const step = (qp['step'] as Step) || 'basic';
    const roleParam = (qp['role'] || '').toString().toLowerCase();
    const isVendorRole = roleParam === 'vendor';

    const validSteps: Step[] = ['basic', 'vendor', 'location'];
    const isValidStep = validSteps.includes(step);
    
    if (!isValidStep) {
      return this.router.createUrlTree([], {
        queryParams: { ...qp, step: 'basic' },
      });
    }
    if ((step === 'vendor' || step === 'location') && !isVendorRole) {
      return this.router.createUrlTree([], {
        queryParams: { ...qp, step: 'basic' },
      });
    }
    return true;
  }
}
