import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { Node, Link } from '../interfaces/mindmap.interface';

@Injectable({
  providedIn: 'root',
})
export class D3Service {
  private simulation!: d3.Simulation<Node, Link>;

  /**
   * Creates a D3.js simulation for a force-directed graph layout.
   *
   * @param width - The width of the graph container.
   * @param height - The height of the graph container.
   * @returns A D3.js simulation instance for the force-directed graph layout.
   */
  createSimulation(width: number, height: number): d3.Simulation<Node, Link> {
    return d3
      .forceSimulation<Node>()
      .force(
        'link',
        d3.forceLink<Node, Link>().id((d) => d.id)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));
  }
}
