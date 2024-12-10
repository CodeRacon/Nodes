import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class KIService {
  // private apiUrl = `api/1/ai/${environment.infomaniac.product_id}/openai/chat/completions`;

  private apiUrl = `https://node-proxy-arm9.onrender.com/api/1/ai/${environment.infomaniac.product_id}/openai/chat/completions`;
  private apiToken = `${environment.infomaniac.token}`;

  kiInput: string = '';
  response: string | null = null;

  constructor(private http: HttpClient) {}

  /**
   * Sends a prompt to the AI service and returns the response as an Observable.
   * The prompt is sent as a JSON payload with the following structure:
   *
   * {
   *   messages: [
   *     {
   *       role: 'system',
   *       content: 'Allways use MarkDown syntax for formatting. Response detailed and well-structured. Allways format your answer with headings, lists, and/or other formatting elements if suitable. Do not use any other language than german.'
   *     },
   *     {
   *       content: <content>,
   *       role: 'user'
   *     }
   *   ],
   *   model: 'mixtral'
   * }
   *
   * The response from the AI service is returned as an Observable.
   * @param content The prompt to send to the AI service.
   * @returns An Observable containing the response from the AI service.
   */
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
            'Allways use MarkDown syntax for formatting. Response detailed and well-structured. Allways format your answer with headings, lists, and/or other formatting elements if suitable. Do not use any other language than german.',
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

  /**
   * Sends a prompt to the AI service and updates the response property with the result.
   * If the `kiInput` property is not empty, it sends the prompt to the AI service using the `sendPrompt` method.
   * The response from the AI service is then stored in the `response` property.
   * If there is an error sending the prompt, the `response` property is set to an error message.
   * After the response is received, the `kiInput` property is reset to an empty string.
   */
  getAIResponse() {
    if (this.kiInput.trim()) {
      this.sendPrompt(this.kiInput).subscribe({
        next: (data) => {
          this.response =
            data?.choices?.[0]?.message?.content || 'Keine Antwort erhalten.';
          console.log(data);
        },
        error: (error) => {
          console.error('Fehler beim Senden der Nachricht:', error);
          this.response = 'Fehler beim Abrufen der Antwort.';
        },
      });
      this.kiInput = '';
    }
  }
}
