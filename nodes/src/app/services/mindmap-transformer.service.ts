import { Injectable } from '@angular/core';
import { LearningEntry } from '../interfaces/learning-entry.interface';
import { Node, Link, MindmapData } from '../interfaces/mindmap.interface';

@Injectable({
  providedIn: 'root',
})
export class MindmapTransformerService {
  transformEntriesToGraph(entries: LearningEntry[]): {
    nodes: d3.SimulationNodeDatum[];
    links: d3.SimulationLinkDatum<d3.SimulationNodeDatum>[];
  } {
    const nodes: d3.SimulationNodeDatum[] = [];
    const links: d3.SimulationLinkDatum<d3.SimulationNodeDatum>[] = [];
    const topicMap = new Map<string, Set<string>>();
    const subTopicConnections = new Map<string, Set<string>>();

    // Hauptthemen und ihre Unterthemen gruppieren
    entries.forEach((entry) => {
      // Hauptthemen verarbeiten
      if (!topicMap.has(entry.mainTopic)) {
        topicMap.set(entry.mainTopic, new Set());
      }

      // Unterthemen und ihre Verbindungen verarbeiten
      if (entry.subTopic) {
        topicMap.get(entry.mainTopic)?.add(entry.subTopic);

        // Unterthemen-Verbindungen tracken
        if (!subTopicConnections.has(entry.subTopic)) {
          subTopicConnections.set(entry.subTopic, new Set());
        }
        subTopicConnections.get(entry.subTopic)?.add(entry.mainTopic);
      }
    });

    // Knoten erstellen
    topicMap.forEach((subTopics, mainTopic) => {
      // Hauptthema hinzufügen
      nodes.push({
        id: mainTopic,
        group: 1,
      } as d3.SimulationNodeDatum);

      // Unterthemen hinzufügen
      subTopics.forEach((subTopic) => {
        if (!nodes.some((n) => (n as any).id === subTopic)) {
          nodes.push({
            id: subTopic,
            group: 2,
            // Mehrfachverbindungen in den Metadaten speichern
            connections: Array.from(subTopicConnections.get(subTopic) || []),
          } as d3.SimulationNodeDatum);
        }

        // Verbindung erstellen
        links.push({
          source: mainTopic,
          target: subTopic,
        } as d3.SimulationLinkDatum<d3.SimulationNodeDatum>);
      });
    });

    return { nodes, links };
  }
}
