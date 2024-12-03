import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpeechService } from '../../services/speech.service';
import { BehaviorSubject } from 'rxjs';
import { TranscriptionResponse } from '../../interfaces/speech.interface';

@Component({
  selector: 'app-audio-recorder',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="recorder-container">
      <button
        [class.recording]="isRecording$ | async"
        (click)="toggleRecording()"
        class="record-button"
      >
        {{ (isRecording$ | async) ? '⏹️ Stop' : '🎤 Start' }}
      </button>
    </div>
  `,
  styleUrls: ['./audio-recorder.component.scss'],
})
export class AudioRecorderComponent {
  private mediaRecorder?: MediaRecorder;
  private audioChunks: Blob[] = [];
  isRecording$ = new BehaviorSubject<boolean>(false);

  constructor(private speechService: SpeechService) {}

  async toggleRecording() {
    if (this.isRecording$.value) {
      this.stopRecording();
    } else {
      await this.startRecording();
    }
  }

  private async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mimeType = 'audio/webm;codecs=opus';
      console.log('Using MIME type:', mimeType);

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log('Chunk size:', event.data.size, 'Type:', event.data.type);
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const audioFile = new File(this.audioChunks, 'recording.opus', {
          type: 'audio/opus', // Direkt als opus-Format
          lastModified: Date.now(),
        });

        console.log('Final file:', audioFile.type, audioFile.size);

        this.speechService.transcribeAudio(audioFile).subscribe({
          next: (response: TranscriptionResponse) => {
            console.log('Transcription:', response);
            this.isRecording$.next(false);
          },
          error: (err: Error) => {
            console.error('Transcription error:', err);
            this.isRecording$.next(false);
          },
          complete: () => {
            this.audioChunks = [];
          },
        });
      };

      this.mediaRecorder.start(1000);
      this.isRecording$.next(true);
    } catch (err) {
      console.error('Recording failed:', err);
      this.isRecording$.next(false);
    }
  }

  private stopRecording() {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      this.isRecording$.next(false);
    }
  }
}
