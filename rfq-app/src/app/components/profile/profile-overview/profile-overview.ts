import { Component, Input } from '@angular/core';
import { User } from '../../../models/user.model';

@Component({
  standalone: false,
  selector: 'app-profile-overview',
  templateUrl: './profile-overview.html',
  styleUrl: './profile-overview.scss',
})
export class ProfileOverviewComponent {
  @Input() user: User | null = null;

  getStatusBadgeClass(statusName?: string): string {
    const name = (statusName || '').toLowerCase();

    if (name.includes('active'))
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
    if (name.includes('pending'))
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
    if (name.includes('suspended'))
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  }

  public getInitials(firstName?: string, lastName?: string): string {
    const f = (firstName ?? '').trim();
    const l = (lastName ?? '').trim();

    const fi = f ? f[0].toUpperCase() : '';
    const li = l ? l[0].toUpperCase() : '';

    return fi + li || '?';
  }
}
