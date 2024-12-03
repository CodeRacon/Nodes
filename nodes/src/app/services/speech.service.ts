import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
  HttpEventType,
  HttpResponse,
} from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap, finalize, map, filter } from 'rxjs/operators';
import { TranscriptionResponse } from '../interfaces/speech.interface';
import { environment } from '../../../environments/environment';

interface TranscriptionOptions {
  language?: string;
  responseFormat?: 'json' | 'srt' | 'text' | 'verbose_json' | 'vtt';
  chunkLength?: number;
  prompt?: string;
  noSpeechThreshold?: number;
}

@Injectable({
  providedIn: 'root',
})
export class SpeechService {
  private readonly API_PATH = `/api/1/ai/${environment.infomaniac.product_id}/openai/audio/transcriptions`;
  private isProcessing = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {}

  transcribeAudio(
    audioFile: File,
    options: TranscriptionOptions = {}
  ): Observable<TranscriptionResponse> {
    const formData = new FormData();

    // Debug-Logging mit MIME-Type Check
    console.log('Sending file:', {
      name: audioFile.name,
      type: audioFile.type,
      size: audioFile.size,
      expectedType: 'audio/opus',
    });

    // Explizit als opus-Format senden
    formData.append(
      'file',
      new File([audioFile], 'recording.opus', {
        type: 'audio/opus',
        lastModified: audioFile.lastModified,
      })
    );
    formData.append('model', 'whisper');
    formData.append('language', options.language || 'de');

    // Debug-Logging für FormData
    console.log('FormData keys:');
    formData.forEach((value, key) => {
      console.log(key, value);
    });

    const headers = new HttpHeaders({
      Authorization: `Bearer ${environment.infomaniac.token}`,
    });

    return this.http
      .post<TranscriptionResponse>(this.API_PATH, formData, {
        headers,
        reportProgress: true,
        observe: 'events',
      })
      .pipe(
        tap((event) => {
          if (event.type === HttpEventType.UploadProgress) {
            console.log(
              `Upload: ${Math.round((100 * event.loaded) / event.total!)}%`
            );
          }
        }),
        filter((event) => event.type === HttpEventType.Response),
        map((event) => event as HttpResponse<TranscriptionResponse>),
        map((response) => response.body!),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ein Fehler ist aufgetreten';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client-Fehler: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 422) {
        errorMessage = 'Ungültiges Audio-Format oder Datei zu groß';
      } else if (error.status === 401) {
        errorMessage = 'Authentifizierungsfehler';
      }
    }

    console.error('Transcription error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  isProcessingState(): Observable<boolean> {
    return this.isProcessing.asObservable();
  }
}
