import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LearningService } from '../../services/learning.service';
import { MindmapTransformerService } from '../../services/mindmap-transformer.service';
import { Node, Link, MindmapData } from '../../interfaces/mindmap.interface';
import { D3ConfigService } from '../../services/d3-config.service';
import { NodeHandlerService } from '../../services/node-handler.service';
import { LinkHandlerService } from '../../services/link-handler.service';
import { VisibilityManagerService } from '../../services/visibility-manager.service';
import { GraphEventsService } from '../../services/graph-events.service';
import * as d3 from 'd3';
import { NodeDetailDialogComponent } from '../node-detail-dialog/node-detail-dialog.component';
import { Subject } from 'rxjs';
import { takeUntil, take, tap } from 'rxjs/operators';
import { DialogResult } from '../../interfaces/dialog-result.interface';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { AddNodeDialogComponent } from '../add-node-dialog/add-node-dialog.component';
import { LearningEntry } from '../../interfaces/learning-entry.interface';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-mindmap-visualization',
  standalone: true,
  imports: [CommonModule, MatIcon, MatButtonModule],
  templateUrl: './mindmap-visualization.component.html',
  styleUrl: './mindmap-visualization.component.scss',
})
export class MindmapVisualizationComponent implements OnInit {
  @ViewChild('graphContainer', { static: true }) graphContainer!: ElementRef;

  private destroy$ = new Subject<void>();

  public width = 1200;
  public height = 800;

  private svg: any;
  private simulation: any;
  private data: MindmapData = {
    nodes: [] as Node[],
    links: [] as Link[],
  };

  constructor(
    private learningService: LearningService,
    private transformer: MindmapTransformerService,
    private d3Config: D3ConfigService,
    private nodeHandler: NodeHandlerService,
    private linkHandler: LinkHandlerService,
    private visibilityManager: VisibilityManagerService,
    private graphEvents: GraphEventsService,
    private dialog: MatDialog
  ) {
    this.nodeHandler.nodeUpdated
      .pipe(takeUntil(this.destroy$))
      .subscribe((path) => {
        this.loadData(path);
      });
  }

  /**
   * Initializes the mindmap visualization by loading the data and initializing the graph.
   * This method is called when the component is initialized.
   */
  ngOnInit(): void {
    this.loadData();
  }

  /**
   * Loads data for the mindmap visualization and initializes the graph.
   *
   * @param keepOpenPath - An optional object containing information about a path to keep open in the mindmap.
   * @param keepOpenPath.mainTopic - The main topic of the path to keep open.
   * @param keepOpenPath.subTopic - The sub-topic of the path to keep open.
   * @param keepOpenPath.title - The title of the path to keep open.
   */
  private loadData(keepOpenPath?: {
    mainTopic: string;
    subTopic: string;
    title: string;
  }): void {
    // Clear existing graph
    d3.select('#graph-container').selectAll('*').remove();

    // Reset visibility if no path provided
    if (!keepOpenPath) {
      this.visibilityManager.hideAllChildNodes(this.data.nodes);
    }

    // Load and transform new data
    this.learningService
      .getEntries()
      .pipe(
        tap(),
        take(1),
        takeUntil(this.destroy$)
      )
      .subscribe((entries) => {
        const transformedData =
          this.transformer.transformEntriesToGraph(entries);
        this.data = {
          nodes: transformedData.nodes as Node[],
          links: transformedData.links as Link[],
        };

        this.initializeGraph();

        if (keepOpenPath) {
          this.animatePathOpening(keepOpenPath);
        }
      });
  }

  
  /**
   * Cleans up the component's subscriptions and resources when the component is destroyed.
   * This method is called by Angular when the component is about to be destroyed.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initializes the graph visualization by creating the SVG container, setting up the simulation, and rendering the nodes and links.
   */
  private initializeGraph(): void {
    this.createSvg();
    this.simulation = this.d3Config.createSimulation(this.width, this.height);
    this.visibilityManager.hideAllChildNodes(this.data.nodes);

    const links = this.linkHandler.createLinks(
      this.svg,
      this.data.links,
      this.data.nodes
    );
    const nodes = this.nodeHandler.renderNodes(
      this.svg,
      this.data.nodes,
      this.simulation,
      this.graphEvents.createDragHandler.bind(this.graphEvents),
      links
    );
    this.setupSimulation(nodes, links);
  }

  /**
   * Creates the SVG container for the graph visualization.
   * This method selects the '#graph-container' element and appends an SVG element with the specified width and height.
   */
  private createSvg(): void {
    this.svg = d3
      .select('#graph-container')
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);
  }

  /**
   * Sets up the simulation for the graph visualization.
   * This method configures the simulation with the nodes and links data, and sets up the event handlers for the simulation.
   * @param nodes - The nodes in the graph visualization.
   * @param links - The links in the graph visualization.
   */
  private setupSimulation(nodes: any, links: any): void {
    this.simulation.nodes(this.data.nodes);
    this.simulation.force('link').links(this.data.links);

    this.graphEvents.setupSimulationEvents(
      this.simulation,
      () => {
        this.linkHandler.updateLinkPositions(links);
        nodes.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
      },
      this.width, // Neu!
      this.height // Neu!
    );
  }

  /**
   * Opens a dialog to add a new node to the mindmap visualization.
   * The dialog is opened using the `AddNodeDialogComponent` and configured with a width of '1000px' and disabling the close button.
   * When the dialog is closed, the method checks if the result has a 'created' status, and if so, calls the `createNewNodes` method with the result.
   */
  openAddNodeDialog(): void {
    const dialogRef = this.dialog.open(AddNodeDialogComponent, {
      width: '1000px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: DialogResult) => {
      if (result?.status === 'created') {
        this.createNewNodes(result);
      }
    });
  }

  /**
   * Creates a new learning entry in the database based on the provided dialog result.
   * The method extracts the necessary information from the dialog result, creates a new `LearningEntry` object, and adds it to the database using the `learningService`.
   * After the entry is added, the method calls `loadData` with the path from the dialog result to refresh the data in the visualization.
   * @param result - The dialog result object containing the information for the new learning entry.
   */
  private async createNewNodes(result: DialogResult): Promise<void> {
    if (!result || !result.path) return;

    const entry: Partial<LearningEntry> = {
      mainTopic: result.path.mainTopic,
      subTopic: result.path.subTopic,
      title: result.path.title,
      description: result.kiContent || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.learningService.addEntry(entry as LearningEntry);
    this.loadData(result.path);
  }

  /**
   * Opens a dialog to display the details of a node in the mindmap visualization.
   * If the node has a group of 3, it opens the `NodeDetailDialogComponent` with the node's details.
   * When the dialog is closed, it checks the result status and performs the appropriate action:
   * - If the status is 'deleted', it reloads the data without a path.
   * - If the status is 'updated', it reloads the data with the updated path.
   * @param node - The node for which the details should be displayed.
   */
  openNodeDetails(node: Node): void {
    if (node.group === 3) {
      const dialogRef = this.dialog.open(NodeDetailDialogComponent, {
        data: {
          id: node.firestoreId,
          title: node.name,
          description: node.description,
          createdAt: node.createdAt,
          mainTopic: this.findMainTopic(node),
          subTopic: this.findSubTopic(node),
        },
      });

      dialogRef
        .afterClosed()
        .pipe(take(1))
        .subscribe({
          next: (result: unknown) => {
            const typedResult = result as { status?: string; path?: any };

            switch (typedResult?.status) {
              case 'deleted':
                this.loadData(); // Simple reload without path
                break;
              case 'updated':
                this.loadData(typedResult.path);
                break;
            }
          },
          error: (err: any) => console.error('Dialog subscription error:', err),
        });
    }
  }

  /**
   * Hilfsmethoden zum Finden der Topic-Hierarchie
   * Finds the main topic for the given node by traversing up the node hierarchy to the root node.
   * @param node - The node for which the main topic should be found.
   * @returns The name of the root node, or an empty string if the root node cannot be found.
   */
  private findMainTopic(node: Node): string {
    const rootNode = this.findRootNode(node);
    return rootNode?.name || '';
  }

  /**
   * Finds the sub-topic for the given node by traversing up the node hierarchy to the parent node.
   * @param node - The node for which the sub-topic should be found.
   * @returns The name of the parent node, or an empty string if the parent node cannot be found.
   */
  private findSubTopic(node: Node): string {
    const parentNode = this.data.nodes.find((n) => n.id === node.parent);
    return parentNode?.name || '';
  }

  /**
   * Finds the root node for the given node by traversing up the node hierarchy.
   * @param node - The node for which the root node should be found.
   * @returns The root node, or `undefined` if the root node cannot be found.
   */
  private findRootNode(node: Node): Node | undefined {
    let currentNode = node;
    while (currentNode.parent) {
      const parentNode = this.data.nodes.find(
        (n) => n.id === currentNode.parent
      );
      if (!parentNode) break;
      currentNode = parentNode;
    }
    return currentNode;
  }

  /**
   * Animates the opening of a path in the mindmap visualization.
   * This method is responsible for expanding the root-level node, the middle-level nodes under the root, and the leaf-level nodes under the specific middle-level node.
   * The animation is performed in a sequence of timeouts to create a smooth visual effect.
   * @param path - An object containing the main topic, sub-topic, and title of the path to be opened.
   */
  private animatePathOpening(path: {
    mainTopic: string;
    subTopic: string;
    title: string;
  }): void {
    const rootNode = this.data.nodes.find((n) => n.id === path.mainTopic);
    const subTopicNode = this.data.nodes.find(
      (n) => n.id === `${path.mainTopic}-${path.subTopic}`
    );

    if (!rootNode || !subTopicNode) return;

    const linkElements = this.svg.selectAll('line');

    setTimeout(() => {
      // Root-Level öffnen und alle Middle-Nodes anzeigen
      rootNode.collapsed = false;

      // Alle Middle-Nodes unter dieser Root öffnen
      this.data.nodes
        .filter((node) => node.group === 2 && node.parent === rootNode.id)
        .forEach((node) => {
          node.collapsed = false;
        });

      this.linkHandler.updateLinkVisibility(linkElements, this.data.nodes);
      this.updateVisibility();

      setTimeout(() => {
        // Alle Leaf-Nodes an der spezifischen Middle-Node öffnen
        this.data.nodes
          .filter((node) => node.group === 3 && node.parent === subTopicNode.id)
          .forEach((node) => {
            node.collapsed = false;
          });

        this.linkHandler.updateLinkVisibility(linkElements, this.data.nodes);
        this.updateVisibility();
      }, 800);
    }, 500);
  }

  /**
   * Updates the visibility of nodes and links in the mindmap visualization.
   * This method is responsible for showing or hiding nodes based on their collapsed state, and updating the visibility of links accordingly.
   * The simulation is also restarted to ensure the visualization is updated.
   */
  private updateVisibility(): void {
    const nodeGroup = this.svg.selectAll('.node');
    const linkElements = this.svg.selectAll('.link');

    nodeGroup.style('display', (node: Node) => {
      if (node.group === 1) return 'block';
      return node.collapsed ? 'none' : 'block';
    });

    this.linkHandler.updateLinkVisibility(linkElements, this.data.nodes);
    this.simulation.alpha(1).restart();
  }
}
