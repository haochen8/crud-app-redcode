export interface Book {
  id: number;
  title: string;
  author: string;
  publishedDate: string;
  createdAt: string;
}

export interface CreateBookRequest {
  title: string;
  author: string;
  publishedDate: string;
}

export type UpdateBookRequest = CreateBookRequest;

export interface BookFormValue {
  title: string;
  author: string;
  publishedDate: string;
}

export function toBookRequest(value: BookFormValue): CreateBookRequest {
  return {
    title: value.title.trim(),
    author: value.author.trim(),
    publishedDate: toDateInputValue(value.publishedDate),
  };
}

export function toBookFormValue(book: Book): BookFormValue {
  return {
    title: book.title,
    author: book.author,
    publishedDate: toDateInputValue(book.publishedDate),
  };
}

export function toDateInputValue(value: string): string {
  const dateOnlyValue = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(dateOnlyValue) ? dateOnlyValue : '';
}
