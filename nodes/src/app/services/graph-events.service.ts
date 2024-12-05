import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { Node } from '../interfaces/mindmap.interface';
import { VisibilityManagerService } from './visibility-manager.service';
import { LinkHandlerService } from './link-handler.service';

@Injectable({
  providedIn: 'root',
})
export class GraphEventsService {
  constructor(
    private visibilityManager: VisibilityManagerService,
    private linkHandler: LinkHandlerService
  ) {}

  createDragHandler(
    simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>
  ) {
    return d3
      .drag<any, any>()
      .on('start', (event, d) => this.handleDragStart(event, d, simulation))
      .on('drag', (event, d) => this.handleDrag(event, d))
      .on('end', (event, d) => this.handleDragEnd(event, d, simulation));
  }

  handleNodeClick(
    event: MouseEvent,
    clickedNode: Node,
    nodes: Node[],
    linkElements: d3.Selection<any, any, any, any>
  ): void {
    event.stopPropagation();

    if (clickedNode.group === 1) {
      if (!clickedNode.collapsed) {
        // Beim Schließen alles ausblenden
        nodes.forEach((node) => {
          if (node.group !== 1) node.collapsed = true;
        });
        linkElements.style('display', 'none');
      } else {
        // Beim Öffnen: Group-2 Children und deren Links zu Root einblenden
        nodes
          .filter((node) => node.group === 2 && node.parent === clickedNode.id)
          .forEach((node) => {
            node.collapsed = false;
            linkElements
              .filter(
                (l: any) =>
                  l.source.id === clickedNode.id && l.target.id === node.id
              )
              .style('display', 'block');
          });
      }
      clickedNode.collapsed = !clickedNode.collapsed;
    } else if (clickedNode.group === 2) {
      // Erst alle existierenden Group-3 Links ausblenden
      linkElements
        .filter((l: any) => l.target.group === 3)
        .style('display', 'none');

      const hasVisibleChildren = nodes.some(
        (node) =>
          node.group === 3 && node.parent === clickedNode.id && !node.collapsed
      );

      if (hasVisibleChildren) {
        nodes
          .filter((node) => node.group === 3 && node.parent === clickedNode.id)
          .forEach((node) => {
            node.collapsed = true;
          });
      } else {
        nodes
          .filter((node) => node.group === 3)
          .forEach((node) => (node.collapsed = true));

        nodes
          .filter((node) => node.group === 3 && node.parent === clickedNode.id)
          .forEach((node) => {
            node.collapsed = false;
            linkElements
              .filter((l: any) => l.target.id === node.id)
              .style('display', 'block');
          });
      }
    }
  }

  setupSimulationEvents(
    simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>,
    onTick: () => void
  ): void {
    simulation.on('tick', onTick);
  }

  private handleDragStart(
    event: any,
    d: any,
    simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>
  ): void {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  private handleDrag(event: any, d: any): void {
    d.fx = event.x;
    d.fy = event.y;
  }

  private handleDragEnd(
    event: any,
    d: any,
    simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>
  ): void {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  private handleGroup1Click(clickedNode: Node, nodes: Node[]): void {
    // Alle anderen Group-1 Nodes schließen
    nodes
      .filter((node) => node.group === 1 && node.id !== clickedNode.id)
      .forEach((node) => {
        node.collapsed = true;
      });

    // Direkte Group-2 Children togglen
    const directChildren = nodes.filter(
      (node) => node.group === 2 && node.parent === clickedNode.id
    );
    directChildren.forEach((child) => {
      child.collapsed = clickedNode.collapsed;
      // Group-3 Children IMMER collapsed
      nodes
        .filter((grandChild) => grandChild.parent === child.id)
        .forEach((grandChild) => (grandChild.collapsed = true));
    });
  }

  private handleGroup2Click(clickedNode: Node, nodes: Node[]): void {
    // Direkte Group-3 Children einblenden
    nodes
      .filter((node) => node.group === 3 && node.parent === clickedNode.id)
      .forEach((child) => (child.collapsed = false));
  }
}
