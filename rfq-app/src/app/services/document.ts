import { HttpClient, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, filter, map, Observable, Subject, tap, throwError } from 'rxjs';
import { RemoteOpenOptions } from '../models/document';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private inFlight = new Set<string>();      // prevent duplicate clicks
  private revokeAfterMs = 60_000;

  progress$ = new Subject<number>();         // optional progress stream (0..100)

  constructor(private http: HttpClient) {}

  /** Base64 -> PDF new tab */
  openDocument(pdfBase64: string, fileName = 'Document.pdf'): void {
    try {
      const bytes = Uint8Array.from(atob(pdfBase64), c => c.charCodeAt(0));
      this.openBlob(new Blob([bytes], { type: 'application/pdf' }), fileName);
    } catch (e) { console.error('openDocument(base64) failed', e); }
  }

  /** Local File -> new tab */
  openLocalFile(file: File): void {
    const url = URL.createObjectURL(file);
    this.openInNewTab(url, file.name);
    setTimeout(() => URL.revokeObjectURL(url), this.revokeAfterMs);
  }

  /** Blob -> new tab */
  openBlob(blob: Blob, fileName = 'Document'): void {
    const url = URL.createObjectURL(blob);
    this.openInNewTab(url, fileName);
    setTimeout(() => URL.revokeObjectURL(url), this.revokeAfterMs);
  }

  /**
   * Remote URL (protected) -> download as blob -> new tab
   * Returns an Observable that completes when the tab is opened.
   */
  openRemote(url: string, opts: RemoteOpenOptions = {}): Observable<void> {
    if (this.inFlight.has(url)) return new Observable<void>(o => { o.complete(); });

    this.inFlight.add(url);

    let headers = new HttpHeaders(opts.extraHeaders || {});
    if (opts.token) headers = headers.set('Authorization', `Bearer ${opts.token}`);

    // Prefer interceptor for token. Keep withCredentials=false if using only Bearer.
    const withCreds = !!opts.withCredentials;

    return this.http.get(url, {
      responseType: 'blob',
      withCredentials: withCreds,
      headers,
      observe: 'events',
      reportProgress: true
    }).pipe(
      tap(event => {
        if (event.type === HttpEventType.DownloadProgress && event.total) {
          this.progress$.next(Math.round(100 * (event.loaded / event.total)));
        }
      }),
      filter(e => e.type === HttpEventType.Response),
      map(e => e.body as Blob),
      tap(blob => this.openBlob(blob, opts.fileName || 'Document')),
      map(() => void 0),
      catchError(err => {
        console.error('openRemote error', err);
        return throwError(() => err);
      }),
      tap({ finalize: () => this.inFlight.delete(url) })
    );
  }

  /** Simply open a (public or pre-signed) URL directly */
  openPublicUrl(url: string, title = 'Document'): void {
    this.openInNewTab(url, title);
  }

  // ---- internals ----
  private openInNewTab(url: string, _title: string): void {
    const win = window.open(url, '_blank', 'noopener,noreferrer');
    if (!win) this.downloadFallback(url, _title);
  }
  private downloadFallback(url: string, fileName: string) {
    const a = document.createElement('a');
    a.href = url; a.download = fileName; a.target = '_blank'; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }
}
