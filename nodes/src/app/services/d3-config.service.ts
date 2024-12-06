import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { SimulationConfig, NodeStyleConfig } from '../types/graph.types';

@Injectable({
  providedIn: 'root',
})
export class D3ConfigService {
  private readonly nodeStyles: NodeStyleConfig = {
    colors: {
      1: '#8B5CC0', // Orange für Root-Nodes
      2: '#B849BA', // Blau für Zwischen-Nodes
      3: '#BA496E', // Grün für Leaf-Nodes
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
      .alphaDecay(0.125) // Schnellere Stabilisierung
      .velocityDecay(0.675); // Mehr Dämpfung
  }

  private createLinkForce() {
    return d3
      .forceLink()
      .id((d: any) => d.id)
      .distance((d: any) => {
        // Prüfe die verbundenen Node-Gruppen
        const sourceGroup = (d.source as any).group;
        const targetGroup = (d.target as any).group;

        // Root zu Middle Node Abstand
        if (sourceGroup === 1 && targetGroup === 2) {
          return 75; // Fester Abstand für Root->Middle
        }
        // Middle zu Leaf Node Abstand
        if (sourceGroup === 2 && targetGroup === 3) {
          return 45; // Kürzerer Abstand für Middle->Leaf
        }
        return 45; // Default Abstand
      })
      .strength((d: any) => {
        // Stärkere Kraft für Root->Middle Verbindungen
        const sourceGroup = (d.source as any).group;
        const targetGroup = (d.target as any).group;

        if (sourceGroup === 1 && targetGroup === 2) {
          return 0.8; // Stärkere Bindung
        }
        return 0.65; // Default Stärke
      });
  }

  private createChargeForce() {
    return d3.forceManyBody().strength(-25);
  }

  private createCenterForce(width: number, height: number) {
    return d3.forceCenter(width / 2, height / 2).strength(0.95);
  }

  private createCollisionForce() {
    return d3.forceCollide().radius(65).strength(0.65); // Stärkere Kollisionsvermeidung
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
