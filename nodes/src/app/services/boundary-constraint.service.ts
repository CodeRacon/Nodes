import { Injectable } from '@angular/core';
import { Node } from '../interfaces/mindmap.interface';

@Injectable({
  providedIn: 'root',
})
export class BoundaryConstraintService {
  /**
   * Applies boundary constraints to a given node within the specified width, height, and padding.
   *
   * This method ensures that the node's position is kept within the specified boundaries, preventing
   * the node from going outside the defined area.
   *
   * @param node The node to apply the boundary constraints to.
   * @param width The width of the boundary area.
   * @param height The height of the boundary area.
   * @param padding The padding around the boundary area.
   */
  applyBoundaryConstraints(
    node: Node,
    width: number,
    height: number,
    padding: number = 72
  ): void {
    const radius = this.getNodeRadius(node);

    node.x = Math.max(
      padding + radius,
      Math.min(width - padding - radius, node.x || 0)
    );
    node.y = Math.max(
      padding + radius,
      Math.min(height - padding - radius, node.y || 0)
    );
  }

  /**
   * Calculates the radius of a node based on its group.
   *
   * @param node The node to get the radius for.
   * @returns The radius of the node.
   */
  private getNodeRadius(node: Node): number {
    switch (node.group) {
      case 1:
        return 50;
      case 2:
        return 35;
      case 3:
        return 25;
      default:
        return 15;
    }
  }
}
