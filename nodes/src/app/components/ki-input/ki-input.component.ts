import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KIService } from '../../services/ki.service';

@Component({
  selector: 'app-ki-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ki-input.component.html',
  styleUrl: './ki-input.component.scss'
})
export class KIInputComponent {

KIService = inject(KIService);

kiInput: string = '';
response: string | null = null;


sendPrompt(){
  if (this.kiInput.trim()) {
    this.KIService.sendPrompt(this.kiInput).subscribe({
      next: (data) => {
        this.response = data?.choices?.[0]?.message?.content || 'Keine Antwort erhalten.';
        console.log(data)
      },
      error: (error) => {
        console.error('Fehler beim Senden der Nachricht:', error);
        this.response = 'Fehler beim Abrufen der Antwort.';
      }
    })
    this.kiInput = '';
    }
  }
}
