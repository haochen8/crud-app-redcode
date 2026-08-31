import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Quote, toQuoteRequest } from './quote.models';
import { QuoteService } from './quote.service';

describe('QuoteService', () => {
  let service: QuoteService;
  let httpTesting: HttpTestingController;
  const url = `${environment.apiUrl}/quotes`;
  const quote: Quote = {
    id: 1,
    text: 'Knowledge is power.',
    author: 'Francis Bacon',
    createdAt: '2026-08-31T18:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(QuoteService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('uses typed endpoints for every CRUD operation', () => {
    service.getAll().subscribe();
    const list = httpTesting.expectOne(url);
    expect(list.request.method).toBe('GET');
    list.flush([quote]);

    service.getById(1).subscribe();
    const get = httpTesting.expectOne(`${url}/1`);
    expect(get.request.method).toBe('GET');
    get.flush(quote);

    const payload = { text: quote.text, author: quote.author };
    service.create(payload).subscribe();
    const create = httpTesting.expectOne(url);
    expect(create.request.method).toBe('POST');
    expect(create.request.body).toEqual(payload);
    create.flush(quote);

    service.update(1, payload).subscribe();
    const update = httpTesting.expectOne(`${url}/1`);
    expect(update.request.method).toBe('PUT');
    expect(update.request.body).toEqual(payload);
    update.flush(quote);

    service.delete(1).subscribe();
    const remove = httpTesting.expectOne(`${url}/1`);
    expect(remove.request.method).toBe('DELETE');
    remove.flush(null);
  });

  it('normalizes quote form values', () => {
    expect(toQuoteRequest({ text: '  Knowledge is power. ', author: ' Francis Bacon ' })).toEqual({
      text: 'Knowledge is power.',
      author: 'Francis Bacon',
    });
  });
});
