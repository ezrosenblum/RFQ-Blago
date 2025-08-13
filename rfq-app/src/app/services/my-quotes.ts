import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { MyQuotesList, MyQuotesRequest } from '../models/my-quotes';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class QuoteService {
  constructor(private http: HttpClient) {}

  getMyQuotes(request: MyQuotesRequest): Observable<MyQuotesList> {
    return this.http
      .post<MyQuotesList>(
        `${environment.apiUrl}Submission/quote/search`,
        request
      )
      .pipe(
        map((response: MyQuotesList) => {
          return response;
        })
      );
  }
}
