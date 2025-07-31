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
}
