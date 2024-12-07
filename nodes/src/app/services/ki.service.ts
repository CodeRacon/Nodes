import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class KIService {
  private apiUrl = `api/1/ai/${environment.infomaniac.product_id}/openai/chat/completions`;
  private apiToken = `${environment.infomaniac.token}`;

  constructor(private http: HttpClient) {}

  sendPrompt(content: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json',
    });

    const body = {
      messages: [
        {
          role: 'system',
          content:
            'Use MarkDown syntax for formatting. Response detailed, well structured, with headings, lists, and other formatting elements if siutable. Do not use any other language than german.',
        },
        {
          content,
          role: 'user',
        },
      ],
      model: 'mixtral',
    };
    console.log(body);

    return this.http.post(this.apiUrl, body, { headers });
  }
}
