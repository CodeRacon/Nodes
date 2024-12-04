export interface Node extends d3.SimulationNodeDatum {
  id: string;
  group: number;
  collapsed?: boolean;
  name?: string;
  parent?: string;
}

export interface Link {
  source: string | Node;
  target: string | Node;
}

export interface MindmapData {
  nodes: Node[];
  links: Link[];
}
