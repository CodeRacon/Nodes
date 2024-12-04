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
    const subTopicMap = new Map<string, Set<string>>();

    // Hauptthemen und ihre Unterthemen gruppieren
    entries.forEach((entry) => {
      // Hauptthema -> Unterthema
      if (!topicMap.has(entry.mainTopic)) {
        topicMap.set(entry.mainTopic, new Set());
      }
      if (entry.subTopic) {
        topicMap.get(entry.mainTopic)?.add(entry.subTopic);

        // Unterthema -> Title
        if (!subTopicMap.has(entry.subTopic)) {
          subTopicMap.set(entry.subTopic, new Set());
        }
        subTopicMap.get(entry.subTopic)?.add(entry.title);
      }
    });

    // Knoten erstellen
    topicMap.forEach((subTopics, mainTopic) => {
      // Level 1: Hauptthema
      nodes.push({
        id: mainTopic,
        name: mainTopic,
        group: 1,
        collapsed: false,
      } as d3.SimulationNodeDatum);

      // Level 2: Unterthemen
      subTopics.forEach((subTopic) => {
        if (!nodes.some((n) => (n as any).id === subTopic)) {
          nodes.push({
            id: subTopic,
            name: subTopic,
            group: 2,
            collapsed: false,
            parent: mainTopic,
          } as d3.SimulationNodeDatum);
        }

        links.push({
          source: mainTopic,
          target: subTopic,
        } as d3.SimulationLinkDatum<d3.SimulationNodeDatum>);

        // Level 3: Titles
        const titles = subTopicMap.get(subTopic) || new Set();
        titles.forEach((title) => {
          if (!nodes.some((n) => (n as any).id === title)) {
            nodes.push({
              id: title,
              name: title,
              group: 3,
              collapsed: false,
              parent: subTopic,
            } as d3.SimulationNodeDatum);
          }

          links.push({
            source: subTopic,
            target: title,
          } as d3.SimulationLinkDatum<d3.SimulationNodeDatum>);
        });
      });
    });

    return { nodes, links };
  }
}
