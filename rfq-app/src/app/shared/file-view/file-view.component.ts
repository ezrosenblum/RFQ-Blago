import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FileItem } from '../../models/form-validation';

@Component({
  selector: 'app-file-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-view.component.html',
  styleUrl: './file-view.component.scss',
})

export class FileViewComponent {
  @Input() files: FileItem[] = [];

  getFileIconClass(fileType: string): string {
    const type = fileType.toLowerCase();

    if (type.includes('image')) return 'bg-green-500';
    if (type.includes('pdf')) return 'bg-red-500';
    if (type.includes('word') || type.includes('document')) return 'bg-blue-500';
    if (type.includes('excel') || type.includes('spreadsheet')) return 'bg-emerald-500';
    if (type.includes('powerpoint') || type.includes('presentation')) return 'bg-orange-500';
    if (type.includes('video')) return 'bg-purple-500';
    if (type.includes('audio')) return 'bg-pink-500';
    if (type.includes('zip') || type.includes('rar') || type.includes('archive')) return 'bg-yellow-500';
    if (type.includes('text') || type.includes('plain')) return 'bg-gray-500';

    return 'bg-indigo-500';
  }

  getFileIconPath(fileType: string): string {
    const type = fileType.toLowerCase();

    if (type.includes('image')) {
      return 'M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z';
    }
    if (type.includes('pdf')) {
      return 'M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-5L9 2H4z';
    }
    if (type.includes('video')) {
      return 'M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14 6l-3.086 3.086a2 2 0 000 2.828L14 15V6z';
    }
    if (type.includes('audio')) {
      return 'M18 3a3 3 0 00-3 3v12a3 3 0 003 3 3 3 0 003-3V6a3 3 0 00-3-3zm-5 15a9 9 0 01-9-9A9 9 0 014 0a9 9 0 019 9 9 9 0 01-9 9z';
    }
    return 'M9 2a1 1 0 000 2h2a1 1 0 100-2H9z M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5z';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  }

  getFileExtension(filename: string): string {
    return filename.split('.').pop() || 'file';
  }

  onView(file: FileItem): void {
    if (file.file) {
      const url = URL.createObjectURL(file.file);
      const newWindow = window.open(url, '_blank');

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    }
  }

  onRemove(file: FileItem): void {
    console.log('Remove file:', file);
  }
}
