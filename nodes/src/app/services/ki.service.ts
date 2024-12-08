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

  kiInput: string = '';
  response: string | null = null;

  constructor(private http: HttpClient) {}

  /**
   * Sendet eine Anfrage an den OpenAI-Chat-Endpunkt und gibt das Antwort-Observable zurück.
   *
   * @param content - Der Inhalt der Nachricht, die an den OpenAI-Chat-Endpunkt gesendet werden soll.
   * @returns Ein Observable, das die Antwort vom OpenAI-Chat-Endpunkt enthält.
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
   * Verarbeitet die Eingabe des Benutzers, sendet eine Anfrage an den OpenAI-Chat-Endpunkt und speichert die Antwort.
   *
   * Diese Methode wird aufgerufen, wenn der Benutzer eine Eingabe getätigt hat. Sie überprüft zunächst, ob die Eingabe nicht leer ist. Wenn dies der Fall ist, wird die `sendPrompt`-Methode aufgerufen, um eine Anfrage an den OpenAI-Chat-Endpunkt zu senden. Die Antwort wird dann in der `response`-Eigenschaft gespeichert. Wenn ein Fehler auftritt, wird eine Fehlermeldung in der `response`-Eigenschaft gespeichert.
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
