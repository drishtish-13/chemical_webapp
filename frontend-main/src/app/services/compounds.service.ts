import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface Compound {
  id: number;
  name: string;
  image: string;
  description?: string;
}

export interface PageResponse {
  compounds: Compound[];
  meta: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CompoundsService {
  // make sure this matches your backend host/port
  private apiUrl = 'http://localhost:4000/api/compounds';

  constructor(private http: HttpClient) {}

  // Request a page from backend and normalize shape to PageResponse
  getPage(page = 1, limit = 10): Observable<PageResponse> {
    const url = `${this.apiUrl}?page=${page}&limit=${limit}`;
    return this.http.get<any>(url).pipe(
      map((res) => {
        // Backend expected to return { data: [...], meta: {...} }
        const data = res.data ?? res.compounds ?? [];
        const meta = res.meta ?? {
          total: (res.total ?? data.length),
          page: page,
          per_page: limit,
          total_pages: Math.ceil((res.total ?? data.length) / limit)
        };
        return {
          compounds: data,
          meta: {
            total: meta.total ?? meta.count ?? (data.length),
            page: meta.page ?? page,
            per_page: meta.per_page ?? meta.limit ?? limit,
            total_pages: meta.total_pages ?? Math.ceil((meta.total ?? data.length) / (meta.per_page ?? limit))
          }
        } as PageResponse;
      })
    );
  }

  get(id: number) {
    return this.http.get<Compound>(`${this.apiUrl}/${id}`);
  }

  update(id: number, payload: Partial<Compound>) {
    return this.http.put(`${this.apiUrl}/${id}`, payload);
  }

  create(payload: Partial<Compound>) {
    return this.http.post(this.apiUrl, payload);
  }

  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
