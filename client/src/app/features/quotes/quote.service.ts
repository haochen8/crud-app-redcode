import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Quote, QuoteRequest } from './quote.models';

@Injectable({ providedIn: 'root' })
export class QuoteService {
  private readonly http = inject(HttpClient);
  private readonly quotesUrl = `${environment.apiUrl}/quotes`;

  getAll(): Observable<Quote[]> {
    return this.http.get<Quote[]>(this.quotesUrl);
  }

  getById(id: number): Observable<Quote> {
    return this.http.get<Quote>(`${this.quotesUrl}/${id}`);
  }

  create(request: QuoteRequest): Observable<Quote> {
    return this.http.post<Quote>(this.quotesUrl, request);
  }

  update(id: number, request: QuoteRequest): Observable<Quote> {
    return this.http.put<Quote>(`${this.quotesUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.quotesUrl}/${id}`);
  }
}
