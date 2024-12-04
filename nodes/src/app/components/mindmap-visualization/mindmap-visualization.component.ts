import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { CommonModule } from '@angular/common';
import { LearningService } from '../../services/learning.service';
import { MindmapTransformerService } from '../../services/mindmap-transformer.service';
import { Node, Link, MindmapData } from '../../interfaces/mindmap.interface';
import { BaseType } from 'd3';

@Component({
  selector: 'app-mindmap-visualization',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mindmap-visualization.component.html',
  styleUrl: './mindmap-visualization.component.scss',
})
export class MindmapVisualizationComponent implements OnInit {
  @ViewChild('graphContainer', { static: true }) graphContainer!: ElementRef;
  private width = 1200;
  private height = 1200;
  private svg: any;
  private simulation: any;
  private data: MindmapData = {
    nodes: [] as Node[],
    links: [] as Link[],
  };

  constructor(
    private learningService: LearningService,
    private transformer: MindmapTransformerService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.learningService.getEntries().subscribe((entries) => {
      const transformedData = this.transformer.transformEntriesToGraph(entries);
      this.data = {
        nodes: transformedData.nodes as Node[],
        links: transformedData.links as Link[],
      };
      this.createSvg();
      this.createGraph();
    });
  }

  private createSvg(): void {
    this.svg = d3
      .select('#graph-container')
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);
  }

  private renderNodes(
    container: d3.Selection<SVGGElement, unknown, HTMLElement, any>
  ) {
    const nodeGroup = container
      .selectAll<SVGGElement, d3.SimulationNodeDatum>('.node')
      .data(this.data.nodes)
      .join('g')
      .attr('class', 'node')
      .call(this.drag(this.simulation) as any);

    // Kreise für die Knoten
    nodeGroup
      .selectAll('circle')
      .data((d) => [d])
      .join('circle')
      .attr('r', (d: any) => (d.group === 1 ? 50 : 20))
      .attr('fill', (d: any) => (d.group === 1 ? '#ff7f0e' : '#1f77b4'));

    // Text-Labels
    nodeGroup
      .selectAll('text')
      .data((d) => [d])
      .join('text')
      .attr('text-anchor', (d: any) => (d.group === 1 ? 'middle' : 'start')) // Zentriert Text für Hauptthemen
      .attr('dx', (d: any) => (d.group === 1 ? 0 : 30)) // Kein dx-Offset für Hauptthemen
      .attr('dy', '.35em')
      .attr('font-size', (d: any) => (d.group === 1 ? '14px' : '12px'))
      .attr('font-weight', (d: any) => (d.group === 1 ? 'bold' : 'normal'))
      .attr('font-family', 'Arial, Helvetica, sans-serif')
      .text((d: any) => d.id)
      .attr('fill', '#333')
      .each(function (this: BaseType, d: any) {
        const _element = d3.select(this);
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

    return nodeGroup;
  }

  private createGraph(): void {
    this.simulation = d3
      .forceSimulation(this.data.nodes as d3.SimulationNodeDatum[])
      .force(
        'link',
        d3
          .forceLink(
            this.data.links as d3.SimulationLinkDatum<d3.SimulationNodeDatum>[]
          )
          .id((d: any) => d.id)
          .distance((d) => {
            const connections = (d.target as any).connections?.length || 0;
            return 100 + connections * 5;
          })
      )
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force('collision', d3.forceCollide().radius(65))
      .force('x', d3.forceX(this.width / 2).strength(0.035)) // Horizontale Zentrierung
      .force('y', d3.forceY(this.height / 2).strength(0.0125)); // Vertikale Zentrierung

    const link = this.svg
      .append('g')
      .selectAll('line')
      .data(this.data.links)
      .join('line')
      .attr('stroke-width', 2)
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('marker-end', 'url(#arrow)');

    const nodeGroup = this.renderNodes(this.svg.append('g'));

    this.simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      nodeGroup.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });
  }

  private drag(simulation: any) {
    function dragStarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragEnded(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return d3
      .drag()
      .on('start', dragStarted)
      .on('drag', dragged)
      .on('end', dragEnded);
  }
}
