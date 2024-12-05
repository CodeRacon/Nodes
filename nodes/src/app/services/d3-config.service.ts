import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { SimulationConfig, NodeStyleConfig } from '../types/graph.types';

@Injectable({
  providedIn: 'root',
})
export class D3ConfigService {
  private readonly nodeStyles: NodeStyleConfig = {
    colors: {
      1: '#ff7f0e', // Orange für Root-Nodes
      2: '#1f77b4', // Blau für Zwischen-Nodes
      3: '#2ca02c', // Grün für Leaf-Nodes
      default: '#999',
    },
    sizes: {
      1: 50,
      2: 30,
      3: 20,
      default: 10,
    },
  };

  createSimulation(
    width: number,
    height: number
  ): d3.Simulation<d3.SimulationNodeDatum, undefined> {
    return d3
      .forceSimulation()
      .force('link', this.createLinkForce())
      .force('charge', this.createChargeForce())
      .force('center', this.createCenterForce(width, height))
      .force('collision', this.createCollisionForce())
      .force('x', this.createXForce(width))
      .force('y', this.createYForce(height))
      .alphaDecay(0.1) // Schnellere Stabilisierung
      .velocityDecay(0.6); // Mehr Dämpfung
  }

  private createLinkForce() {
    return d3
      .forceLink()
      .id((d: any) => d.id)
      .distance((d: any) => {
        const connections = (d.target as any).connections?.length || 0;
        return 100 + connections * 5;
      });
  }

  private createChargeForce() {
    return d3.forceManyBody().strength(-125);
  }

  private createCenterForce(width: number, height: number) {
    return d3.forceCenter(width / 2, height / 2);
  }

  private createCollisionForce() {
    return d3.forceCollide().radius(65);
  }

  private createXForce(width: number) {
    return d3.forceX(width / 2).strength(0.05);
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
