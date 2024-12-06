import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { FFmpeg } from '@ffmpeg/ffmpeg';

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

  // transcribeAudio(
  //   audioFile: File,
  //   options: TranscriptionOptions = {}
  // ): Observable<string> {
  //   const formData = new FormData();
  //   formData.append('file', audioFile);
  //   formData.append('model', 'whisper');

  //   if (options.language) formData.append('language', options.language);
  //   if (options.chunkLength)
  //     formData.append('chunk_length', options.chunkLength.toString());
  //   if (options.responseFormat)
  //     formData.append('response_format', options.responseFormat);

  //   const headers = new HttpHeaders({
  //     'Authorization':`Bearer ${environment.infomaniac.token}`,
  //     'Content-Type': 'application/json'
  //   })

  //   // const audioBlob = new Blob(this.chunks, { type: 'audio/opus' });
  //   // const audioBase64 = this.convertBlobToBase64(audioBlob);

  //   // const body = {
  //   //   audio: audioBase64, // Oder wie auch immer die API den Audio-Inhalt erwartet
  //   //   language: 'de',
  //   //   responseFormat: 'text',
  //   //   chunkLength: 30
  //   // };

  //   return this.http
  //     .post<InfomaniakResponse<string>>(this.API_PATH, formData, { headers })
  //     .pipe(
  //       map((response) => {
  //         if (response.result === 'success' && response.data) {
  //           return response.data;
  //         }
  //         throw new Error('Keine Daten in der Antwort');
  //       }),
  //       catchError(this.handleError)
  //     );
  // }

  transcribeAudio(audioFile: Blob) {
    // Überprüfen, ob die Datei ein gültiges Format hat, z.B. .opus
    const mimeType = audioFile.type;

    if (
      ![
        'audio/mp3',
        'audio/mp4',
        'audio/aac',
        'audio/wav',
        'audio/flac',
        'audio/ogg',
        'audio/opus',
        'audio/wma',
        'audio/m4a',
      ].includes(mimeType)
    ) {
      console.error(
        'Ungültiges Dateiformat. Die Datei muss eines der folgenden Formate haben: mp3, mp4, aac, wav, flac, ogg, opus, wma, m4a.'
      );
      return;
    }

    // Erstelle FormData und füge die Datei hinzu
    const formData = new FormData();
    formData.append('file', audioFile); // Direkt die Datei hinzufügen
    formData.append('model', 'whisper'); // Modell hinzufügen

    // API-Aufruf mit FormData
    fetch(this.API_PATH, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${environment.infomaniac.token}`,
      },
      body: formData, // FormData als Body der Anfrage
    })
      .then((response) => response.json())
      .then((data) => console.log('Transcription result:', data))
      .catch(this.handleError);
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

  public async convertToMp3(blob: Blob): Promise<Blob> {
    const ffmpeg = new FFmpeg();
    await ffmpeg.load();

    // Write file
    await ffmpeg.writeFile(
      'recording.webm',
      new Uint8Array(await blob.arrayBuffer())
    );

    // Convert to MP3
    await ffmpeg.exec(['-i', 'recording.webm', 'output.mp3']);

    // Read output
    const data = await ffmpeg.readFile('output.mp3');
    return new Blob([data], { type: 'audio/mp3' });
  }
}
