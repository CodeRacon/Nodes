import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { Link, Node } from '../interfaces/mindmap.interface';

@Injectable({
  providedIn: 'root',
})
export class LinkHandlerService {
  createLinks(
    svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>,
    links: Link[],
    nodes: Node[]
  ) {
    return svg
      .append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', 2)
      .attr('stroke', '#e6e6e6')
      .attr('stroke-opacity', 0.6)
      .style('display', (d: any) =>
        this.determineInitialLinkVisibility(d, nodes)
      );
  }

  updateLinkPositions(linkElements: d3.Selection<any, any, any, any>) {
    linkElements
      .attr('x1', (d: any) => d.source.x)
      .attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x)
      .attr('y2', (d: any) => d.target.y);
  }

  updateLinkVisibility(
    linkElements: d3.Selection<any, any, any, any>,
    nodes: Node[]
  ) {
    linkElements.style('display', (link: any) => {
      const source = nodes.find((n) => n.id === (link.source as any).id);
      const target = nodes.find((n) => n.id === (link.target as any).id);

      // Prüfe ob der Link überhaupt sichtbar sein soll
      if (!source || !target) return 'none';

      // Prüfe ob der Parent-Node collapsed ist
      if (this.isParentCollapsed(target, nodes)) return 'none';

      // Links zwischen Root-Nodes und ihren direkten Children initial anzeigen
      if (source.group === 1 && target.group === 2)
        return target.collapsed ? 'none' : 'block';
      if (source.group === 2 && target.group === 3)
        return target.collapsed ? 'none' : 'block';

      return 'none';
    });
  }

  private determineInitialLinkVisibility(link: any, nodes: Node[]): string {
    const source = nodes.find((n) => n.id === (link.source as any).id);
    const target = nodes.find((n) => n.id === (link.target as any).id);

    if (!source || !target) return 'none';
    if (this.isParentCollapsed(target, nodes)) return 'none';

    // Links zwischen Root-Nodes und ihren direkten Children initial anzeigen
    if (source.group === 1 && target.group === 2) return 'block';
    if (source.group === 2 && target.group === 3) return 'block';
    return 'none';
  }

  private isParentCollapsed(node: Node, nodes: Node[]): boolean {
    if (!node.parent) return false;
    const parent = nodes.find((n) => n.id === node.parent);
    if (!parent) return false;
    if (parent.collapsed) return true;
    return this.isParentCollapsed(parent, nodes);
  }
}
