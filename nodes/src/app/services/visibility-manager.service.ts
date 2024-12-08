import { Injectable } from '@angular/core';
import { Node, Link } from '../interfaces/mindmap.interface';

@Injectable({
  providedIn: 'root',
})
export class VisibilityManagerService {
  /**
   * Hides all child nodes with group 2 or 3.
   * @param nodes - An array of nodes to check and collapse.
   */
  hideAllChildNodes(nodes: Node[]): void {
    nodes.forEach((node) => {
      if (node.group === 2 || node.group === 3) {
        node.collapsed = true;
      }
    });
  }

  /**
   * Returns an array of visible nodes from the given array of nodes.
   * Nodes with group 1 are always visible. Nodes with a parent are only visible
   * if their parent node is not collapsed.
   * @param nodes - An array of nodes to filter.
   * @returns An array of visible nodes.
   */
  getVisibleNodes(nodes: Node[]): Node[] {
    return nodes.filter((node) => {
      if (node.group === 1) return true;
      if (node.parent) {
        const parentNode = nodes.find((pn) => pn.id === node.parent);
        return !parentNode?.collapsed;
      }
      return true;
    });
  }

  /**
   * Returns an array of visible links from the given array of links, based on the visible nodes.
   * A link is considered visible if both its source and target nodes are in the visibleNodes array.
   * @param links - An array of links to filter.
   * @param visibleNodes - An array of visible nodes.
   * @returns An array of visible links.
   */
  getVisibleLinks(links: Link[], visibleNodes: Node[]): Link[] {
    return links.filter((link) => {
      return (
        visibleNodes.some((n) => n.id === (link.target as any).id) &&
        visibleNodes.some((n) => n.id === (link.source as any).id)
      );
    });
  }

  /**
   * Recursively checks if a node's parent is collapsed.
   * @param node - The node to check.
   * @param nodes - The array of all nodes.
   * @returns `true` if the node's parent is collapsed, `false` otherwise.
   */
  isParentCollapsed(node: Node, nodes: Node[]): boolean {
    if (!node.parent) return false;
    const parent = nodes.find((n) => n.id === node.parent);
    if (!parent) return false;
    if (parent.collapsed) return true;
    return this.isParentCollapsed(parent, nodes);
  }

  /**
   * Recursively checks if a node is a descendant of the given parent node.
   * @param node - The node to check.
   * @param parentNode - The parent node to check against.
   * @param nodes - The array of all nodes.
   * @returns `true` if the node is a descendant of the parent node, `false` otherwise.
   */
  isDescendantOf(node: Node, parentNode: Node, nodes: Node[]): boolean {
    if (!node || !node.parent) return false;
    if (node.parent === parentNode.id) return true;
    const parent = nodes.find((n) => n.id === node.parent);
    return parent ? this.isDescendantOf(parent, parentNode, nodes) : false;
  }
}
