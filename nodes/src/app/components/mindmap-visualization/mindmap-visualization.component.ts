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

@Component({
  selector: 'app-mindmap-visualization',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mindmap-visualization.component.html',
  styleUrl: './mindmap-visualization.component.scss',
})
export class MindmapVisualizationComponent implements OnInit {
  @ViewChild('graphContainer', { static: true }) graphContainer!: ElementRef;

  public width = 1200;
  public height = 1200;

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
    private graphEvents: GraphEventsService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.learningService.getEntries().subscribe((entries) => {
      console.log('Eingehende Entries:', entries);
      const transformedData = this.transformer.transformEntriesToGraph(entries);
      console.log('Transformierte Daten:', transformedData);
      this.data = {
        nodes: transformedData.nodes as Node[],
        links: transformedData.links as Link[],
      };
      this.initializeGraph();
    });
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
      links // Hier das links-Argument hinzufügen
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

    this.graphEvents.setupSimulationEvents(this.simulation, () => {
      this.linkHandler.updateLinkPositions(links);
      nodes.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });
  }
}
