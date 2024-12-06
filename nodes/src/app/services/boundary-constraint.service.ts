import { Injectable } from '@angular/core';
import { Node } from '../interfaces/mindmap.interface';

@Injectable({
  providedIn: 'root',
})
export class BoundaryConstraintService {
  applyBoundaryConstraints(
    node: Node,
    width: number,
    height: number,
    padding: number = 72
  ): void {
    const radius = this.getNodeRadius(node);

    // Forciere stärkere Begrenzung
    node.x = Math.max(
      padding + radius,
      Math.min(width - padding - radius, node.x || 0)
    );
    node.y = Math.max(
      padding + radius,
      Math.min(height - padding - radius, node.y || 0)
    );
  }

  private getNodeRadius(node: Node): number {
    // Deutlich größere Radien
    switch (node.group) {
      case 1:
        return 50; // Von 25 auf 50
      case 2:
        return 35; // Von 15 auf 35
      case 3:
        return 25; // Von 10 auf 25
      default:
        return 15; // Von 5 auf 15
    }
  }
}
