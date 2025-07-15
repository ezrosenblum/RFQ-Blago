// src/app/shared/loading-spinner/loading-spinner.component.ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: false,
  templateUrl: './loading-spinner.html',
  styleUrls: ['./loading-spinner.scss']
})
export class LoadingSpinner {
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() color: 'primary' | 'secondary' | 'white' = 'primary';
  @Input() message: string = '';
  @Input() overlay: boolean = false;

  getSizeClass(): string {
    switch (this.size) {
      case 'small':
        return 'h-4 w-4';
      case 'large':
        return 'h-8 w-8';
      default:
        return 'h-6 w-6';
    }
  }

  getColorClass(): string {
    switch (this.color) {
      case 'secondary':
        return 'text-secondary-600';
      case 'white':
        return 'text-white';
      default:
        return 'text-primary-600';
    }
  }

  getMessageSizeClass(): string {
    switch (this.size) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-lg';
      default:
        return 'text-base';
    }
  }
}

// src/app/shared/loading-spinner/loading-spinner.component.html
