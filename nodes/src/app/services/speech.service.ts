import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface TranscriptionOptions {
  language?: 'de' | 'en';
  chunkLength?: number; // 2-30 Sekunden
  responseFormat?: 'json' | 'srt' | 'text' | 'verbose_json' | 'vtt';
  noSpeechThreshold?: number; // Default: 0.6
  prompt?: string;
}
interface InfomaniakResponse<T> {
  result: 'success' | 'error';
  data?: T;
  error?: {
    code: string;
    description: string;
    context?: any;
    errors?: Array<{
      code: string;
      description: string;
      context?: any;
    }>;
  };
}

@Injectable({ providedIn: 'root' })
export class SpeechService {
  private readonly API_PATH = `/api/1/ai/${environment.infomaniac.product_id}/openai/audio/transcriptions`;

  constructor(private http: HttpClient) {}

  transcribeAudio(
    audioFile: File,
    options: TranscriptionOptions = {}
  ): Observable<string> {
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', 'whisperV2');

    if (options.language) formData.append('language', options.language);
    if (options.chunkLength)
      formData.append('chunk_length', options.chunkLength.toString());
    if (options.responseFormat)
      formData.append('response_format', options.responseFormat);

    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${environment.infomaniac.token}`
    );

    return this.http
      .post<InfomaniakResponse<string>>(this.API_PATH, formData, { headers })
      .pipe(
        map((response) => {
          if (response.result === 'success' && response.data) {
            return response.data;
          }
          throw new Error('Keine Daten in der Antwort');
        }),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ein technischer Fehler ist aufgetreten';

    if (error.error?.error) {
      // Infomaniak spezifischer Fehler
      errorMessage = error.error.error.description;
      console.error('API Fehler:', error.error.error);
    } else if (error.status === 422) {
      errorMessage = 'Ungültiges Audio-Format oder Datei zu groß (max 25MB)';
    } else if (error.status === 401) {
      errorMessage = 'Authentifizierungsfehler - Token ungültig';
    } else if (error.status === 429) {
      errorMessage = 'Rate Limit erreicht (max 60 Anfragen/Minute)';
    }

    return throwError(() => new Error(errorMessage));
  }
}
