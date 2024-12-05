import * as d3 from 'd3';

export interface Node extends d3.SimulationNodeDatum {
  id: string;
  group: number;
  collapsed?: boolean;
  name?: string;
  parent?: string;
  description?: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  index?: number;
}

export interface MindmapData {
  nodes: Node[];
  links: Link[];
}
