export interface Node {
  id: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface Link {
  source: string | Node;
  target: string | Node;
}

export interface MindmapData {
  nodes: Node[];
  links: Link[];
}
