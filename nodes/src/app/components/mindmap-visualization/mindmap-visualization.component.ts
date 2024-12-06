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
import { Dialog } from '@angular/cdk/dialog';
import { skip, distinctUntilChanged, Subject } from 'rxjs';
import { takeUntil, take, filter, tap } from 'rxjs/operators';
import { DialogResult } from '../../interfaces/dialog-result.interface';

@Component({
  selector: 'app-mindmap-visualization',
  standalone: true,
  imports: [CommonModule, NodeDetailDialogComponent],
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
    private dialog: Dialog
  ) {
    this.nodeHandler.nodeUpdated
      .pipe(takeUntil(this.destroy$))
      .subscribe((path) => {
        this.loadData(path);
      });
  }

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(keepOpenPath?: {
    mainTopic: string;
    subTopic: string;
    title: string;
  }): void {
    console.log('LoadData started');

    // Clear existing graph
    d3.select('#graph-container').selectAll('*').remove();

    // Reset visibility if no path provided
    if (!keepOpenPath) {
      console.log('No path provided, resetting view');
      this.visibilityManager.hideAllChildNodes(this.data.nodes);
    }

    // Load and transform new data
    this.learningService
      .getEntries()
      .pipe(
        tap((entries) => console.log('Received entries:', entries.length)),
        take(1),
        takeUntil(this.destroy$)
      )
      .subscribe((entries) => {
        console.log('Processing entries');
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Neue Methode zum Aktualisieren nach Dialog-Schließung
  private handleDialogClose(result: any): void {
    if (result?.status === 'updated' && result?.path) {
      this.loadData(result.path);
    }
  }

  private updateGraph(newData: MindmapData): void {
    this.data = newData;
    // Bestehende Simulation aktualisieren statt neu zu initialisieren
    this.simulation.nodes(this.data.nodes);
    this.simulation.force('link').links(this.data.links);
    this.simulation.alpha(1).restart();
  }

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

  private createSvg(): void {
    this.svg = d3
      .select('#graph-container')
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);
  }

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

      dialogRef.closed.pipe(take(1)).subscribe({
        next: (result: unknown) => {
          const typedResult = result as { status?: string; path?: any };
          console.log('Dialog result received:', typedResult);

          switch (typedResult?.status) {
            case 'deleted':
              console.log('Node deleted, reloading data');
              this.loadData(); // Simple reload without path
              break;
            case 'updated':
              console.log('Node updated, reloading with path');
              this.loadData(typedResult.path);
              break;
          }
        },
        error: (err) => console.error('Dialog subscription error:', err),
      });
    }
  }

  // Hilfsmethoden zum Finden der Topic-Hierarchie
  private findMainTopic(node: Node): string {
    const rootNode = this.findRootNode(node);
    return rootNode?.name || '';
  }

  private findSubTopic(node: Node): string {
    const parentNode = this.data.nodes.find((n) => n.id === node.parent);
    return parentNode?.name || '';
  }

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

  private showLinks(sourceId: string, targetId: string): void {
    this.svg
      .selectAll('.link')
      .filter((l: any) => l.source.id === sourceId && l.target.id === targetId)
      .style('display', 'block');
  }

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
