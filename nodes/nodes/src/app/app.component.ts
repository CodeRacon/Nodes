import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MindmapVisualizationComponent } from './components/mindmap-visualization/mindmap-visualization.component';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, MindmapVisualizationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'nodes';
}