export interface Node {
  id: string;
  group: number;
}

export interface Link {
  source: string | Node;
  target: string | Node;
}

export interface MindmapData {
  nodes: Node[];
  links: Link[];
}
