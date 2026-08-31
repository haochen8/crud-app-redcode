export interface Quote {
  id: number;
  text: string;
  author: string;
  createdAt: string;
}

export interface QuoteRequest {
  text: string;
  author: string;
}

export function toQuoteRequest(value: QuoteRequest): QuoteRequest {
  return { text: value.text.trim(), author: value.author.trim() };
}
