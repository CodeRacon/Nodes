import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { D3ConfigService } from './d3-config.service';
import { Node } from '../interfaces/mindmap.interface';
import { BaseType } from 'd3';
import { GraphEventsService } from './graph-events.service';
import { LinkHandlerService } from './link-handler.service';

@Injectable({
  providedIn: 'root',
})
export class NodeHandlerService {
  constructor(
    private d3Config: D3ConfigService,
    private graphEvents: GraphEventsService,
    private linkHandler: LinkHandlerService
  ) {}

  renderNodes(
    container: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
    nodes: Node[],
    simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>,
    dragHandler: (
      simulation: any
    ) => d3.DragBehavior<Element, unknown, unknown>,
    linkElements: d3.Selection<any, any, any, any>
  ) {
    const nodeGroup = container
      .selectAll<SVGGElement, d3.SimulationNodeDatum>('.node')
      .data(nodes)
      .join(
        (enter) => this.handleNodeEnter(enter, simulation, dragHandler),
        (update) => update,
        (exit) => this.handleNodeExit(exit)
      )
      .on('click', (event: MouseEvent, d: Node) => {
        this.graphEvents.handleNodeClick(event, d, nodes, linkElements);
        nodeGroup.style('display', (node: Node) => {
          if (node.group === 1) return 'block';
          return node.collapsed ? 'none' : 'block';
        });
        simulation.alpha(1).restart();
      });

    this.addNodeCircles(nodeGroup);
    this.addNodeLabels(nodeGroup);
    this.linkHandler.updateLinkVisibility(linkElements, nodes);

    return nodeGroup;
  }

  private handleNodeEnter(enter: any, simulation: any, dragHandler: any) {
    return enter
      .append('g')
      .attr('class', 'node')
      .style('display', (d: Node) => (d.group === 1 ? 'block' : 'none')) // Root-Nodes initial sichtbar
      .call(dragHandler(simulation));
  }

  private handleNodeExit(exit: any) {
    return exit.transition().duration(750).attr('r', 0).remove();
  }

  private addNodeCircles(nodeGroup: any) {
    nodeGroup
      .selectAll('circle')
      .data((d: Node) => [d])
      .join('circle')
      .attr('r', (d: Node) => this.d3Config.getNodeSize(d.group))
      .attr('fill', (d: Node) => this.d3Config.getNodeColor(d.group));
  }

  private addNodeLabels(nodeGroup: any) {
    const labels = nodeGroup
      .selectAll('text')
      .data((d: Node) => [d])
      .join('text')
      .attr('text-anchor', (d: Node) => (d.group === 1 ? 'middle' : 'start'))
      .attr('dx', (d: Node) => (d.group === 1 ? 0 : 30))
      .attr('dy', '.35em')
      .attr(
        'font-size',
        (d: Node) => `${d.group === 1 ? 16 : d.group === 2 ? 14 : 12}px`
      )
      .attr('font-weight', (d: Node) => (d.group === 1 ? 'bold' : 'normal'))
      .attr('font-family', 'Arial, Helvetica, sans-serif')
      .text((d: Node) => d.name || d.id)
      .attr('fill', '#333');

    this.addLabelBackgrounds(labels);
  }

  private addLabelBackgrounds(labels: any) {
    labels.each(function (this: BaseType, d: Node) {
      const element = d3.select(this);
      const bbox = (this as SVGTextElement).getBBox();
      const parent = (this as SVGTextElement).parentNode;

      if (parent instanceof Element) {
        d3.select(parent)
          .insert('rect', 'text')
          .attr('x', bbox.x - 4)
          .attr('y', bbox.y - 4)
          .attr('width', bbox.width + 8)
          .attr('height', bbox.height + 8)
          .attr('fill', 'white')
          .attr('fill-opacity', 0.8)
          .attr('rx', 4)
          .attr('ry', 4);
      }
    });
  }
}
