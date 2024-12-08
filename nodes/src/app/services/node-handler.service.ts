import { inject, Injectable, EventEmitter, Output } from '@angular/core';
import * as d3 from 'd3';
import { D3ConfigService } from './d3-config.service';
import { Node } from '../interfaces/mindmap.interface';
import { BaseType } from 'd3';
import { GraphEventsService } from './graph-events.service';
import { LinkHandlerService } from './link-handler.service';
import { NodeDetailDialogComponent } from '../components/node-detail-dialog/node-detail-dialog.component';
import { MatDialog } from '@angular/material/dialog';

interface DialogResult {
  status: 'updated' | 'deleted';
  path: {
    mainTopic: string;
    subTopic: string;
    title: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class NodeHandlerService {
  @Output() nodeUpdated = new EventEmitter<DialogResult['path']>();

  private dialog = inject(MatDialog);

  constructor(
    private d3Config: D3ConfigService,
    private graphEvents: GraphEventsService,
    private linkHandler: LinkHandlerService
  ) {}

  /**
   * Renders the nodes in the D3 visualization.
   *
   * @param container - The D3 selection of the container element where the nodes will be rendered.
   * @param nodes - An array of `Node` objects representing the data for the nodes.
   * @param simulation - The D3 simulation object that manages the node positions.
   * @param dragHandler - A function that returns a D3 drag behavior for the nodes.
   * @param linkElements - The D3 selection of the link elements in the visualization.
   * @returns The D3 selection of the node group.
   */
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
        event.stopPropagation();
        simulation.alpha(0);
        if (d.group === 3) {
          this.openNodeDetails(d, nodes);
        } else {
          this.graphEvents.handleNodeClick(event, d, nodes, linkElements);
        }
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

  /**
   * Handles the entry of a new node into the D3 visualization.
   *
   * @param enter - The D3 selection of the new node elements.
   * @param simulation - The D3 simulation object that manages the node positions.
   * @param dragHandler - A function that returns a D3 drag behavior for the nodes.
   * @returns The updated D3 selection of the node group.
   */
  private handleNodeEnter(enter: any, simulation: any, dragHandler: any) {
    return enter
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .style('display', (d: Node) => (d.group === 1 ? 'block' : 'none'))
      .call(dragHandler(simulation));
  }

  /**
   * Handles the exit of a node from the D3 visualization.
   *
   * This method is responsible for transitioning the node out of the visualization
   * and removing it from the DOM. The node is transitioned out over a duration of
   * 750 milliseconds, during which its radius is reduced to 0, and then the node
   * is removed from the DOM.
   *
   * @param exit - The D3 selection of the node elements that are exiting the
   * visualization.
   * @returns The updated D3 selection of the node group.
   */
  private handleNodeExit(exit: any) {
    return exit.transition().duration(750).attr('r', 0).remove();
  }

  /**
   * Adds node circles to the D3 visualization.
   *
   * This method is responsible for creating the visual representation of the nodes
   * in the D3 visualization. It creates a set of circular elements for each node,
   * and applies various visual effects to them, such as a light effect and a
   * shadow effect.
   *
   * @param nodeGroup - The D3 selection of the node group elements.
   */
  private addNodeCircles(nodeGroup: any) {
    const defs = nodeGroup.append('defs');

    const lightFilter = defs.append('filter').attr('id', 'lightEffect');

    lightFilter
      .append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', '1.75')
      .attr('result', 'blur');

    lightFilter
      .append('feOffset')
      .attr('in', 'blur')
      .attr('dx', '2.25')
      .attr('dy', '2.25')
      .attr('result', 'offsetBlur');

    lightFilter
      .append('feComposite')
      .attr('in', 'SourceGraphic')
      .attr('in2', 'offsetBlur')
      .attr('operator', 'arithmetic')
      .attr('k1', '1')
      .attr('k2', '0.75')
      .attr('k3', '0.25')
      .attr('k4', '0');

    defs
      .append('filter')
      .attr('id', 'shadowEffect')
      .append('feDropShadow')
      .attr('dx', '-2')
      .attr('dy', '-2')
      .attr('stdDeviation', '4')
      .attr('flood-color', 'rgba(0,0,0,0.125)');

    nodeGroup
      .selectAll('circle')
      .data((d: Node) => [d])
      .join('circle')
      .attr('r', (d: Node) => this.d3Config.getNodeSize(d.group))
      .attr('fill', (d: Node) => this.d3Config.getNodeColor(d.group))
      .style('filter', 'url(#lightEffect) url(#shadowEffect)');
  }

  /**
   * Adds labels to the node group elements in the D3 visualization.
   * The labels are positioned and styled based on the node's group property.
   * It also calls the `addLabelBackgrounds` method to add a white background
   * behind the labels.
   *
   * @param nodeGroup - The D3 selection of the node group elements.
   */
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

  /**
   * Adds a white background behind the labels of the node group elements in the D3 visualization.
   * This method is called by the `addNodeLabels` method to provide a consistent visual style for the labels.
   *
   * @param labels - The D3 selection of the text elements representing the node labels.
   */
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

  /**
   * Opens a dialog to display the details of a node.
   *
   * @param node - The node whose details should be displayed.
   * @param allNodes - An array of all the nodes in the application.
   */
  private openNodeDetails(node: Node, allNodes: Node[]): void {
    const dialogRef = this.dialog.open(NodeDetailDialogComponent, {
      width: '600px',
      data: {
        id: node.firestoreId,
        title: node.name,
        description: node.description,
        createdAt: node.createdAt,
        mainTopic: this.findRootNode(node, allNodes)?.name || '',
        subTopic: allNodes.find((n) => n.id === node.parent)?.name || '',
      },
    });

    dialogRef.afterClosed().subscribe((result: DialogResult) => {
      if (result?.status === 'deleted') {
        this.nodeUpdated.emit();
      } else if (result?.status === 'updated' && result.path) {
        this.nodeUpdated.emit(result.path);
      }
    });
  }

  /**
   * Finds the root node for the given node in the list of all nodes.
   *
   * @param node - The node for which to find the root node.
   * @param allNodes - The list of all nodes in the application.
   * @returns The root node, or `undefined` if the root node cannot be found.
   */
  private findRootNode(node: Node, allNodes: Node[]): Node | undefined {
    let currentNode = node;
    while (currentNode.parent) {
      const parentNode = allNodes.find((n) => n.id === currentNode.parent);
      if (!parentNode) break;
      currentNode = parentNode;
    }
    return currentNode;
  }
}
