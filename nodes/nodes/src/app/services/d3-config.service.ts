import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { SimulationConfig, NodeStyleConfig } from '../types/graph.types';

@Injectable({
  providedIn: 'root',
})
export class D3ConfigService {
  private readonly nodeStyles: NodeStyleConfig = {
    colors: {
      1: '#8B5CC0',
      2: '#B849BA',
      3: '#BA496E',
      default: '#999',
    },
    sizes: {
      1: 50,
      2: 30,
      3: 20,
      default: 10,
    },
  };

  /**
   * Creates a D3 force simulation configuration for the graph visualization.
   * The simulation is configured with various forces, such as link, center, collision, and x/y forces,
   * to control the positioning and behavior of the nodes and links in the visualization.
   *
   * @param width The width of the visualization area.
   * @param height The height of the visualization area.
   * @returns A D3 force simulation configuration.
   */
  createSimulation(
    width: number,
    height: number
  ): d3.Simulation<d3.SimulationNodeDatum, undefined> {
    return (
      d3
        .forceSimulation()
        .force('link', this.createLinkForce())
        // .force('charge', this.createChargeForce())
        .force('center', this.createCenterForce(width, height))
        .force('collision', this.createCollisionForce())
        .force('x', this.createXForce(width))
        .force('y', this.createYForce(height))
        .alphaDecay(0.125)
        .velocityDecay(0.675)
    );
  }

  /**
   * Creates a force link configuration for the D3 simulation.
   * The link force determines the distance and strength between connected nodes.
   * The distance and strength are adjusted based on the groups of the connected nodes.
   *
   * @returns A D3 force link configuration.
   */
  private createLinkForce() {
    return d3
      .forceLink()
      .id((d: any) => d.id)
      .distance((d: any) => {
        const sourceGroup = (d.source as any).group;
        const targetGroup = (d.target as any).group;

        if (sourceGroup === 1 && targetGroup === 2) {
          return 75;
        }
        if (sourceGroup === 2 && targetGroup === 3) {
          return 45;
        }
        return 45;
      })
      .strength((d: any) => {
        const sourceGroup = (d.source as any).group;
        const targetGroup = (d.target as any).group;

        if (sourceGroup === 1 && targetGroup === 2) {
          return 0.8;
        }
        return 0.65;
      });
  }

  private createChargeForce() {
    return d3.forceManyBody().strength(-25);
  }

  private createCenterForce(width: number, height: number) {
    return d3.forceCenter(width / 2, height / 2).strength(0.95);
  }

  private createCollisionForce() {
    return d3.forceCollide().radius(65).strength(0.65);
  }

  private createXForce(width: number) {
    return d3.forceX(width / 2).strength(0.075);
  }

  private createYForce(height: number) {
    return d3.forceY(height / 2).strength(0.05);
  }

  getNodeColor(group: number): string {
    return this.nodeStyles.colors[group] || this.nodeStyles.colors.default;
  }

  getNodeSize(group: number): number {
    return this.nodeStyles.sizes[group] || this.nodeStyles.sizes.default;
  }
}
