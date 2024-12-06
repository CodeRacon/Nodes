import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AudioRecorderComponent } from './components/audio-recorder/audio-recorder.component';
import { SeedService } from './services/seed.service';
import { MindmapVisualizationComponent } from './components/mindmap-visualization/mindmap-visualization.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    AudioRecorderComponent,
    MindmapVisualizationComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'nodes';

  // constructor(private seedService: SeedService) {
  //   // Nur zum Testen!
  //   this.seedService
  //     .seedDummyData()
  //     .then(() => console.log('✅ Dummy-Daten erfolgreich eingefügt!'))
  //     .catch((err) => console.error('❌ Fehler beim Einfügen:', err));
  // }
}
