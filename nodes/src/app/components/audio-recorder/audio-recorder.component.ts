import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpeechService } from '../../services/speech.service';

@Component({
  selector: 'app-audio-recorder',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audio-recorder.component.html',
  styleUrl: './audio-recorder.component.scss',
})
export class AudioRecorderComponent {
  isRecording = signal(false);
  transcription = signal('');
  private mediaRecorder?: MediaRecorder;
  private chunks: Blob[] = [];

  constructor(private speechService: SpeechService) {}

  async toggleRecording() {
    if (this.isRecording()) {
      this.stopRecording();
    } else {
      await this.startRecording();
    }
  }

  private getSupportedMimeType(): string {
    const types = [
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
      'audio/webm;codecs=opus',
      'audio/aac',
      'audio/m4a',
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log('Verwende Audio-Format:', type);
        return type;
      }
    }

    // Fallback auf Standard-Format
    return 'audio/webm';
  }

  private async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.chunks = [];

      const mimeType = this.getSupportedMimeType();

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
      });

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.chunks.push(e.data);
      };

      this.mediaRecorder.onstop = () => this.processRecording();

      this.mediaRecorder.start();
      this.isRecording.set(true);
    } catch (err) {
      console.error('Aufnahmefehler:', err);
    }
  }

  private processRecording() {
    const audioBlob = new Blob(this.chunks, { type: 'audio/opus' });
    const audioFile = new File([audioBlob], 'recording.opus', {
      type: 'audio/opus',
      lastModified: Date.now(),
    });

    // Debug-Logging
    console.log('Audio File Details:', {
      name: audioFile.name,
      type: audioFile.type,
      size: audioFile.size,
      lastModified: audioFile.lastModified,
    });

    console.log('Blob Details:', {
      type: audioBlob.type,
      size: audioBlob.size,
    });

    this.speechService
      .transcribeAudio(audioFile, {
        language: 'de',
        responseFormat: 'text',
        chunkLength: 30,
      })
      .subscribe({
        next: (result) => {
          console.log('Transkriptionsergebnis:', result);
          this.transcription.set(result);
        },
        error: (error) => {
          console.error('Transkriptionsfehler:', error);
          console.log('Request Details:', {
            file: audioFile,
            options: {
              language: 'de',
              responseFormat: 'text',
              chunkLength: 30,
            },
          });
        },
      });
  }

  private stopRecording() {
    if (this.mediaRecorder?.state === 'recording') {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      this.isRecording.set(false);
    }
  }
}
