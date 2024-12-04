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
      'audio/webm ;codecs=opus',
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

  private async processRecording() {
    const audioBlob = new Blob(this.chunks, { type: 'audio/webm' }); // Aufnahme im WebM-Format
    const mp3Blob = await this.speechService.convertToMp3(audioBlob);
  
    const mp3File = new File([mp3Blob], 'recording.mp3', {
      type: 'audio/mp3',
      lastModified: Date.now(),
    });
  
    console.log('MP3 File Details:', {
      name: mp3File.name,
      type: mp3File.type,
      size: mp3File.size,
    });
  
    // Jetzt kannst du die MP3-Datei an die API senden
    this.speechService.transcribeAudio(mp3File);
  }

  // private processRecording() {
  //   const audioBlob = new Blob(this.chunks, { type: 'audio/opus' });
  //   const audioFile = new File([audioBlob], 'recording.opus', {
  //     type: 'audio/opus',
  //     lastModified: Date.now(),
  //   });

  //   // Debug-Logging
  //   console.log('Audio File Details:', {
  //     name: audioFile.name,
  //     type: audioFile.type,
  //     size: audioFile.size,
  //     lastModified: audioFile.lastModified,
  //   }, audioFile
  // );

  //   console.log('Blob Details:', {
  //     type: audioBlob.type,
  //     size: audioBlob.size,
  //   });

  //   const audioUrl = URL.createObjectURL(audioBlob);
  //   const audio = new Audio(audioUrl);
  //   audio.play();

    // this.speechService
    //   .transcribeAudio(audioFile, {
    //     language: 'de',
    //     responseFormat: 'text',
    //     chunkLength: 30,
    //   })
    //   .subscribe({
    //     next: (result) => {
    //       console.log('Transkriptionsergebnis:', result);
    //       this.transcription.set(result);
    //     },
    //     error: (error) => {
    //       console.error('Transkriptionsfehler:', error);
    //       console.log('Request Details:', {
    //         file: audioFile,
    //         options: {
    //           language: 'de',
    //           responseFormat: 'text',
    //           chunkLength: 30,
    //         },
    //       });
    //     },
    //   });

    // this.speechService.transcribeAudio(audioFile);
  // }

  private stopRecording() {
    if (this.mediaRecorder?.state === 'recording') {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      this.isRecording.set(false);
    }
  }
}
