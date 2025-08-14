import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { QuoteItem } from '../../../models/rfq.model';
import { FilePondComponent } from 'ngx-filepond';
import { MessageEntry } from '../../../models/messages.model';
import { User } from '../../../models/user.model';
import { Auth } from '../../../services/auth';
import { take } from 'rxjs';
import { MessagesService } from '../../../services/messages';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-quote-send-message-dialog',
  standalone: false,
  templateUrl: './quote-send-message-dialog.html',
  styleUrl: './quote-send-message-dialog.scss'
})
export class QuoteSendMessageDialog implements OnInit {

  quote!: QuoteItem;
  colorPalette: Array<string> = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500', 'bg-indigo-500', 'bg-teal-500', 'bg-pink-500'];
  showUploadFilesPanel: boolean = false;
  pondOptions = {
      allowMultiple: true,
      maxFiles: 5,
      labelIdle: 'Drag & Drop your files or <span class="filepond--label-action">Browse</span>',
  };
  pondFiles: File[] = [];
  @ViewChild('myPond') myPond!: FilePondComponent;
  uploadedFilesCount = 0;
  
  newMessage: string = '';
  currentUser: User | null = null;
  sendingMessage: boolean = false;

  constructor(
    private _dialogRef: MatDialogRef<QuoteSendMessageDialog>, 
    @Inject(MAT_DIALOG_DATA) public _data: any,
    private _authService: Auth,
    private _messageService: MessagesService,
    private alertService: AlertService
  ){
    this.quote = _data.quote;
  }

  ngOnInit(): void {
    this._authService.currentUserSubject.subscribe({
      next: (user) => {
        if (user) {
          this.currentUser = user;
        }
      }
    });
  }

  sendMessage(): void {
    if (this.newMessage.trim() || this.pondFiles.length > 0) {
      this.sendingMessage = true;
      const formData = new FormData();

      formData.append('SubmissionQuoteId', String(this.quote.id));
      formData.append('Content', this.newMessage);

      this.pondFiles.forEach(file => {
        formData.append('Files', file, file.name);
      });

      this._messageService.sendMessage(formData).pipe(take(1)).subscribe({
          next: (data) => {
          this.newMessage = '';
          this.pondFiles = [];
          this.uploadedFilesCount = 0;
          this.showUploadFilesPanel = false;
          this.alertService.success('VENDOR.MESSAGE_SENT');
          this._dialogRef.close("Success");
          this.sendingMessage = false;
          },
          error: (error) => {
            this.sendingMessage = false;
          },
      })
    }
  }

  // Upload files 
  toggleFileUploadPanel(){
    this.showUploadFilesPanel = !this.showUploadFilesPanel;
  }

  pondHandleInit() {
  }

  pondHandleAddFile(event: any) {
    if (event?.file?.file) {
      this.pondFiles.push(event.file.file as File);
    }
  }

  onFileRemoved(event: any) {
  if (event?.file?.file) {
      const removedFile = event.file.file as File;
      this.pondFiles = this.pondFiles.filter(f => f !== removedFile);
    }
  }

   transform(value: string | undefined | null) {
    if (value) {
      let names = value.split(' ');
      let initials = names[0].substring(0, 1).toUpperCase();
      return initials;
    } else {
      return '';
    }
  }

  mapLetterToElement(name: string): any | undefined {
    if (!name) return this.colorPalette[0];

    const firstLetter = name.charAt(0).toUpperCase();
    const asciiCode = firstLetter.charCodeAt(0);

    if (asciiCode >= 65 && asciiCode <= 90) {
      const index = (asciiCode - 65) % this.colorPalette.length;
      return this.colorPalette[index];
    }
    return this.colorPalette[0];
  }
}
