import { Injectable } from '@angular/core';
import { LearningService } from './learning.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SeedService {
  constructor(private learningService: LearningService) {}

  async seedDummyData() {
    // Prüfen ob bereits Daten existieren
    const existingEntries = await firstValueFrom(
      this.learningService.getEntries()
    );

    if (existingEntries.length > 0) {
      console.log('📚 Datenbank bereits gefüllt, überspringe Seeding');
      return;
    }

    const dummyEntries = [
      {
        title: 'Docker Basics',
        mainTopic: 'DevOps',
        subTopic: 'Containers',
        description: 'Einführung in Docker-Container und ihre Verwaltung',
        createdAt: new Date('2024-04-14'),
      },
      {
        title: 'Git Workflow',
        mainTopic: 'Version Control',
        subTopic: 'Collaboration',
        description: 'Best Practices für Git-Branches und Merge-Strategien',
        createdAt: new Date('2024-04-15'),
      },
      {
        title: 'API Design',
        mainTopic: 'Backend',
        subTopic: 'Development',
        description: 'Grundlagen der API-Entwicklung mit REST und GraphQL',
        createdAt: new Date('2024-04-16'),
      },
      {
        title: 'JWT Authentication',
        mainTopic: 'Security',
        subTopic: 'User Management',
        description: 'Sichere Authentifizierung mit JSON Web Tokens',
        createdAt: new Date('2024-04-17'),
      },
      {
        title: 'WebSocket Basics',
        mainTopic: 'Backend',
        subTopic: 'Communication',
        description: 'Echtzeitkommunikation mit WebSockets einrichten',
        createdAt: new Date('2024-04-18'),
      },
      {
        title: 'CSS Grid Layout',
        mainTopic: 'Frontend',
        subTopic: 'Styling',
        description: 'Erstellen von responsiven Layouts mit CSS Grid',
        createdAt: new Date('2024-04-19'),
      },
      {
        title: 'Accessibility Guidelines',
        mainTopic: 'Frontend',
        subTopic: 'Best Practices',
        description: 'Webseiten barrierefrei gestalten mit WAI-ARIA',
        createdAt: new Date('2024-04-20'),
      },
      {
        title: 'GraphQL Basics',
        mainTopic: 'Backend',
        subTopic: 'API',
        description: 'Datenabfragen mit GraphQL implementieren',
        createdAt: new Date('2024-04-21'),
      },
      {
        title: 'Service Workers',
        mainTopic: 'Frontend',
        subTopic: 'Performance',
        description: 'Offlinefähigkeit mit Service Workern verbessern',
        createdAt: new Date('2024-04-22'),
      },
      {
        title: 'Kubernetes Deployment',
        mainTopic: 'DevOps',
        subTopic: 'Orchestration',
        description: 'Skalierbare Anwendungen mit Kubernetes bereitstellen',
        createdAt: new Date('2024-04-23'),
      },
      {
        title: 'Node.js Streams',
        mainTopic: 'Backend',
        subTopic: 'Programming',
        description: 'Effiziente Datenverarbeitung mit Node.js Streams',
        createdAt: new Date('2024-04-24'),
      },
      {
        title: 'Responsive Images',
        mainTopic: 'Frontend',
        subTopic: 'Media',
        description:
          'Optimierung von Bildern für verschiedene Bildschirmgrößen',
        createdAt: new Date('2024-04-25'),
      },
      {
        title: 'OAuth2 Integration',
        mainTopic: 'Security',
        subTopic: 'Authorization',
        description: 'OAuth2 für Drittanbieter-Anwendungen integrieren',
        createdAt: new Date('2024-04-26'),
      },
      {
        title: 'Code Review Best Practices',
        mainTopic: 'Collaboration',
        subTopic: 'Quality Assurance',
        description: 'Effektive Code Reviews im Team durchführen',
        createdAt: new Date('2024-04-27'),
      },
      {
        title: 'ESLint Setup',
        mainTopic: 'Frontend',
        subTopic: 'Tools',
        description: 'Einrichtung von ESLint für konsistenten JavaScript-Code',
        createdAt: new Date('2024-04-28'),
      },
      {
        title: 'Server-Side Rendering',
        mainTopic: 'Frontend',
        subTopic: 'Performance',
        description: 'SEO-Optimierung durch serverseitiges Rendering',
        createdAt: new Date('2024-04-29'),
      },
      {
        title: 'Design Tokens',
        mainTopic: 'Frontend',
        subTopic: 'Styling',
        description: 'Zentrale Verwaltung von Design-Parametern',
        createdAt: new Date('2024-04-30'),
      },
      {
        title: 'Python Basics',
        mainTopic: 'Programming',
        subTopic: 'Languages',
        description: 'Grundlagen der Python-Programmierung',
        createdAt: new Date('2024-05-01'),
      },
      {
        title: 'MongoDB Aggregation',
        mainTopic: 'Backend',
        subTopic: 'Database',
        description: 'Datenanalyse mit MongoDB Aggregation Pipelines',
        createdAt: new Date('2024-05-02'),
      },
      {
        title: 'Microservices Architecture',
        mainTopic: 'Backend',
        subTopic: 'Design',
        description: 'Entwicklung skalierbarer Anwendungen mit Microservices',
        createdAt: new Date('2024-05-03'),
      },
      {
        title: 'Webpack Configuration',
        mainTopic: 'Frontend',
        subTopic: 'Tools',
        description: 'Anpassung des Webpack-Build-Prozesses',
        createdAt: new Date('2024-05-04'),
      },
      {
        title: 'OAuth Scopes',
        mainTopic: 'Security',
        subTopic: 'Authorization',
        description:
          'Verwendung von Scopes zur Einschränkung von Berechtigungen',
        createdAt: new Date('2024-05-05'),
      },
      {
        title: 'DevTools Profiling',
        mainTopic: 'Frontend',
        subTopic: 'Debugging',
        description: 'Analyse der Performance mit Chrome DevTools',
        createdAt: new Date('2024-05-06'),
      },
      {
        title: 'Event Sourcing',
        mainTopic: 'Backend',
        subTopic: 'Patterns',
        description:
          'Event Sourcing zur Rückverfolgbarkeit von Änderungen nutzen',
        createdAt: new Date('2024-05-07'),
      },
      {
        title: 'Webpack Plugins',
        mainTopic: 'Frontend',
        subTopic: 'Tools',
        description: 'Erweiterung der Webpack-Funktionalität mit Plugins',
        createdAt: new Date('2024-05-08'),
      },
      {
        title: 'Svelte Basics',
        mainTopic: 'Frontend',
        subTopic: 'Framework',
        description: 'Einstieg in die Entwicklung mit Svelte',
        createdAt: new Date('2024-05-09'),
      },
      {
        title: 'Cloud Storage',
        mainTopic: 'Backend',
        subTopic: 'Storage',
        description: 'Speichern und Abrufen von Dateien in der Cloud',
        createdAt: new Date('2024-05-10'),
      },
      {
        title: 'ElasticSearch Queries',
        mainTopic: 'Backend',
        subTopic: 'Database',
        description: 'Effizientes Suchen und Filtern mit ElasticSearch',
        createdAt: new Date('2024-05-11'),
      },
      {
        title: 'TDD with Jest',
        mainTopic: 'Testing',
        subTopic: 'Quality Assurance',
        description: 'Test Driven Development mit Jest umsetzen',
        createdAt: new Date('2024-05-12'),
      },
      {
        title: 'Docker Compose',
        mainTopic: 'DevOps',
        subTopic: 'Containers',
        description: 'Mehrere Container mit Docker Compose orchestrieren',
        createdAt: new Date('2024-05-13'),
      },
      {
        title: 'Redis Caching',
        mainTopic: 'Backend',
        subTopic: 'Optimization',
        description: 'Anwendung von Redis zur Performance-Optimierung',
        createdAt: new Date('2024-05-14'),
      },
      {
        title: 'Progressive Web Apps',
        mainTopic: 'Frontend',
        subTopic: 'Performance',
        description:
          'Erstellen von PWAs mit Offline- und Installationsfähigkeit',
        createdAt: new Date('2024-05-15'),
      },
      {
        title: 'TypeScript Generics',
        mainTopic: 'Programming',
        subTopic: 'Languages',
        description: 'Generische Typen für flexibleren TypeScript-Code',
        createdAt: new Date('2024-05-16'),
      },
      {
        title: 'Log Monitoring',
        mainTopic: 'DevOps',
        subTopic: 'Diagnostics',
        description: 'Überwachung und Analyse von Logs mit ELK Stack',
        createdAt: new Date('2024-05-17'),
      },
      {
        title: 'CSS Variables',
        mainTopic: 'Frontend',
        subTopic: 'Styling',
        description: 'Verwendung von CSS-Variablen für dynamisches Styling',
        createdAt: new Date('2024-05-18'),
      },
      {
        title: 'RabbitMQ Basics',
        mainTopic: 'Backend',
        subTopic: 'Communication',
        description: 'Nachrichtenwarteschlangen mit RabbitMQ implementieren',
        createdAt: new Date('2024-05-19'),
      },
      {
        title: 'Angular Signals',
        mainTopic: 'Frontend',
        subTopic: 'State Management',
        description: 'Reaktive Zustandsverwaltung mit Angular Signals',
        createdAt: new Date('2024-05-20'),
      },
      {
        title: 'JSON Schema Validation',
        mainTopic: 'Backend',
        subTopic: 'Data Integrity',
        description: 'Validierung von Daten mit JSON Schema',
        createdAt: new Date('2024-05-21'),
      },
      {
        title: 'Firebase Authentication',
        mainTopic: 'Backend',
        subTopic: 'Security',
        description: 'Benutzerauthentifizierung mit Firebase implementieren',
        createdAt: new Date('2024-05-22'),
      },
    ];

    for (const entry of dummyEntries) {
      await this.learningService.addEntry(entry);
    }
  }
}
