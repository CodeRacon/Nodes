import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { Node } from '../interfaces/mindmap.interface';
import { BoundaryConstraintService } from './boundary-constraint.service';

@Injectable({
  providedIn: 'root',
})
export class GraphEventsService {
  constructor(private boundaryConstraint: BoundaryConstraintService) {}

  /**
   * Creates a drag handler for the D3 simulation.
   * The drag handler is responsible for handling the start, drag, and end events of a node being dragged.
   *
   * @param simulation - The D3 simulation instance.
   * @returns A D3 drag handler function.
   */
  createDragHandler(
    simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>
  ) {
    return d3
      .drag<any, any>()
      .on('start', (event, d) => this.handleDragStart(event, d, simulation))
      .on('drag', (event, d) => this.handleDrag(event, d))
      .on('end', (event, d) => this.handleDragEnd(event, d, simulation));
  }

  /**
   * Handles the click event on a node in the graph.
   * This function is responsible for collapsing and expanding the node's children and their associated links.
   *
   * @param event - The mouse event object.
   * @param clickedNode - The node that was clicked.
   * @param nodes - An array of all the nodes in the graph.
   * @param linkElements - A D3 selection of the link elements in the graph.
   */
  handleNodeClick(
    event: MouseEvent,
    clickedNode: Node,
    nodes: Node[],
    linkElements: d3.Selection<any, any, any, any>
  ): void {
    event.stopPropagation();

    if (clickedNode.group === 1) {
      if (!clickedNode.collapsed) {
        nodes.forEach((node) => {
          if (node.group !== 1) node.collapsed = true;
        });
        linkElements.style('display', 'none');
      } else {
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
    onTick: () => void,
    width: number,
    height: number
  ): void {
    simulation.on('tick', () => {
      simulation.nodes().forEach((node) => {
        this.boundaryConstraint.applyBoundaryConstraints(
          node as Node,
          width,
          height
        );
      });
      onTick();
    });
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
    nodes
      .filter((node) => node.group === 1 && node.id !== clickedNode.id)
      .forEach((node) => {
        node.collapsed = true;
      });

    const directChildren = nodes.filter(
      (node) => node.group === 2 && node.parent === clickedNode.id
    );
    directChildren.forEach((child) => {
      child.collapsed = clickedNode.collapsed;
      nodes
        .filter((grandChild) => grandChild.parent === child.id)
        .forEach((grandChild) => (grandChild.collapsed = true));
    });
  }

  private handleGroup2Click(clickedNode: Node, nodes: Node[]): void {
    nodes
      .filter((node) => node.group === 3 && node.parent === clickedNode.id)
      .forEach((child) => (child.collapsed = false));
  }
}
