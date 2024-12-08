import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { Link, Node } from '../interfaces/mindmap.interface';

@Injectable({
  providedIn: 'root',
})
export class LinkHandlerService {
  /**
   * Creates a group of link elements in the SVG and sets their initial visibility based on the given nodes.
   *
   * @param svg - The d3.Selection of the SVG element to append the links to.
   * @param links - An array of Link objects representing the connections between nodes.
   * @param nodes - An array of Node objects representing the nodes in the mindmap.
   * @returns The d3.Selection of the newly created link elements.
   */
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

  /**
   * Updates the position of link elements based on the source and target node coordinates.
   *
   * @param linkElements - A d3.Selection of link elements to update.
   */
  updateLinkPositions(linkElements: d3.Selection<any, any, any, any>) {
    linkElements
      .attr('x1', (d: any) => d.source.x)
      .attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x)
      .attr('y2', (d: any) => d.target.y);
  }

  /**
   * Updates the visibility of link elements based on the state of the associated nodes.
   *
   * @param linkElements - A d3.Selection of link elements to update.
   * @param nodes - An array of Node objects representing the nodes in the mindmap.
   */
  updateLinkVisibility(
    linkElements: d3.Selection<any, any, any, any>,
    nodes: Node[]
  ) {
    linkElements.style('display', (link: any) => {
      const source = nodes.find((n) => n.id === (link.source as any).id);
      const target = nodes.find((n) => n.id === (link.target as any).id);

      if (!source || !target) return 'none';

      if (this.isParentCollapsed(target, nodes)) return 'none';

      if (source.group === 1 && target.group === 2)
        return target.collapsed ? 'none' : 'block';
      if (source.group === 2 && target.group === 3)
        return target.collapsed ? 'none' : 'block';

      return 'none';
    });
  }

  /**
   * Determines the initial visibility of a link based on the state of the associated nodes.
   *
   * @param link - The link object to check.
   * @param nodes - An array of Node objects representing the nodes in the mindmap.
   * @returns The CSS 'display' value to set for the link element, either 'block' or 'none'.
   */
  private determineInitialLinkVisibility(link: any, nodes: Node[]): string {
    const source = nodes.find((n) => n.id === (link.source as any).id);
    const target = nodes.find((n) => n.id === (link.target as any).id);

    if (!source || !target) return 'none';
    if (this.isParentCollapsed(target, nodes)) return 'none';

    if (source.group === 1 && target.group === 2) return 'block';
    if (source.group === 2 && target.group === 3) return 'block';
    return 'none';
  }

  /**
   * Recursively checks if the parent of the given node is collapsed.
   *
   * @param node - The node to check.
   * @param nodes - An array of all nodes in the mindmap.
   * @returns `true` if the parent of the given node is collapsed, `false` otherwise.
   */
  private isParentCollapsed(node: Node, nodes: Node[]): boolean {
    if (!node.parent) return false;
    const parent = nodes.find((n) => n.id === node.parent);
    if (!parent) return false;
    if (parent.collapsed) return true;
    return this.isParentCollapsed(parent, nodes);
  }
}
