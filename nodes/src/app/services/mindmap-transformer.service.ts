import { Injectable } from '@angular/core';
import { LearningEntry } from '../interfaces/learning-entry.interface';
import { Node, Link, MindmapData } from '../interfaces/mindmap.interface';

@Injectable({
  providedIn: 'root',
})
export class MindmapTransformerService {
  /**
   * Transforms an array of `LearningEntry` objects into a `MindmapData` object, which contains a list of nodes and links
   * that can be used to render a mindmap visualization.
   *
   * The transformation process involves the following steps:
   * 1. Extract the unique main topics from the `LearningEntry` array.
   * 2. Create a node for each main topic.
   * 3. Create a map of sub-topics for each main topic.
   * 4. Create a node for each sub-topic and a link between the main topic and the sub-topic.
   * 5. Create a node for each entry title and a link between the sub-topic and the entry title.
   *
   * @param entries An array of `LearningEntry` objects to be transformed.
   * @returns A `MindmapData` object containing the nodes and links for the mindmap visualization.
   */
  transformEntriesToGraph(entries: LearningEntry[]): MindmapData {
    const nodes: Node[] = [];
    const links: Link[] = [];

    const mainTopics = [...new Set(entries.map((entry) => entry.mainTopic))];
    mainTopics.forEach((topic) => {
      nodes.push({
        id: topic,
        name: topic,
        group: 1,
        collapsed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

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
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        links.push({
          source: mainTopic,
          target: subTopicId,
        });
      });
    });

    entries.forEach((entry) => {
      const subTopicId = `${entry.mainTopic}-${entry.subTopic}`;
      const titleId = `${subTopicId}-${entry.title}`;
      nodes.push({
        id: titleId,
        firestoreId: entry.id,
        name: entry.title,
        group: 3,
        collapsed: true,
        parent: subTopicId,
        description: entry.description,
        createdAt:
          entry.createdAt instanceof Date ? entry.createdAt : new Date(),
        updatedAt:
          entry.updatedAt instanceof Date ? entry.updatedAt : new Date(),
      });

      links.push({
        source: subTopicId,
        target: titleId,
      });
    });

    return { nodes, links };
  }
}
