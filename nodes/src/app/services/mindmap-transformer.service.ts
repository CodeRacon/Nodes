import { Injectable } from '@angular/core';
import { LearningEntry } from '../interfaces/learning-entry.interface';
import { Node, Link, MindmapData } from '../interfaces/mindmap.interface';

@Injectable({
  providedIn: 'root',
})
export class MindmapTransformerService {
  transformEntriesToGraph(entries: LearningEntry[]): MindmapData {
    const nodes: Node[] = [];
    const links: Link[] = [];

    // 1. Root-Nodes (Group 1) erstellen
    const mainTopics = [...new Set(entries.map((entry) => entry.mainTopic))];
    mainTopics.forEach((topic) => {
      nodes.push({
        id: topic,
        name: topic,
        group: 1,
        collapsed: false,
      });
    });

    // 2. Subtopic-Nodes (Group 2) erstellen
    const subTopicMap = new Map<string, Set<string>>();
    entries.forEach((entry) => {
      if (entry.subTopic) {
        // Null-Check hinzufügen
        if (!subTopicMap.has(entry.mainTopic)) {
          subTopicMap.set(entry.mainTopic, new Set());
        }
        subTopicMap.get(entry.mainTopic)?.add(entry.subTopic);
      }
    });

    subTopicMap.forEach((subTopics, mainTopic) => {
      subTopics.forEach((subTopic) => {
        const subTopicId = `${mainTopic}-${subTopic}`;
        nodes.push({
          id: subTopicId,
          name: subTopic,
          group: 2,
          collapsed: true,
          parent: mainTopic,
        });
        links.push({
          source: mainTopic,
          target: subTopicId,
        });
      });
    });

    // 3. Title-Nodes (Group 3) erstellen
    entries.forEach((entry) => {
      const subTopicId = `${entry.mainTopic}-${entry.subTopic}`;
      const titleId = `${subTopicId}-${entry.title}`;
      nodes.push({
        id: titleId,
        name: entry.title,
        group: 3,
        collapsed: true,
        parent: subTopicId,
        description: entry.description,
      });
      links.push({
        source: subTopicId,
        target: titleId,
      });
    });

    return { nodes, links };
  }
}
