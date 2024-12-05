import { Injectable } from '@angular/core';
import { Node, Link } from '../interfaces/mindmap.interface';

@Injectable({
  providedIn: 'root',
})
export class VisibilityManagerService {
  hideAllChildNodes(nodes: Node[]): void {
    nodes.forEach((node) => {
      if (node.group === 2 || node.group === 3) {
        node.collapsed = true;
      }
    });
  }

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

  getVisibleLinks(links: Link[], visibleNodes: Node[]): Link[] {
    return links.filter((link) => {
      return (
        visibleNodes.some((n) => n.id === (link.target as any).id) &&
        visibleNodes.some((n) => n.id === (link.source as any).id)
      );
    });
  }

  isParentCollapsed(node: Node, nodes: Node[]): boolean {
    if (!node.parent) return false;
    const parent = nodes.find((n) => n.id === node.parent);
    if (!parent) return false;
    if (parent.collapsed) return true;
    return this.isParentCollapsed(parent, nodes);
  }

  isDescendantOf(node: Node, parentNode: Node, nodes: Node[]): boolean {
    if (!node || !node.parent) return false;
    if (node.parent === parentNode.id) return true;
    const parent = nodes.find((n) => n.id === node.parent);
    return parent ? this.isDescendantOf(parent, parentNode, nodes) : false;
  }
}
