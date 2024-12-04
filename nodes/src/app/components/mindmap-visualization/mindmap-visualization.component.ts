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
      .join(
        (enter) =>
          enter
            .append('g')
            .attr('class', 'node')
            .call(this.drag(this.simulation) as any)
            .call((g) => {
              g.append('circle')
                .attr('r', 0)
                .attr('fill', (d: any) => {
                  switch (d.group) {
                    case 1:
                      return '#ff7f0e';
                    case 2:
                      return '#1f77b4';
                    case 3:
                      return '#2ca02c';
                    default:
                      return '#999';
                  }
                })
                .transition()
                .duration(750)
                .attr('r', (d: any) => {
                  switch (d.group) {
                    case 1:
                      return 50;
                    case 2:
                      return 30;
                    case 3:
                      return 20;
                    default:
                      return 10;
                  }
                });
            }),
        (update) => update,
        (exit) => exit.transition().duration(750).attr('r', 0).remove()
      )
      .call(this.drag(this.simulation) as any)
      .on('click', (event: MouseEvent, d: any) => {
        event.stopPropagation();
        d.collapsed = !d.collapsed;

        const visibleLinks = this.data.links.filter((link) => {
          return !this.data.nodes.find(
            (node) =>
              (node as any).id === (link.source as any).id &&
              (node as any).collapsed
          );
        });

        nodeGroup
          .transition()
          .duration(500)
          .style('opacity', (n) => {
            const parentCollapsed = this.data.links.some(
              (link) =>
                (link.target as any).id === (n as any).id &&
                this.data.nodes.find(
                  (node) => (node as any).id === (link.source as any).id
                )?.collapsed
            );
            return parentCollapsed ? 0 : 1;
          });

        const _linkSelection = this.svg
          .selectAll('line')
          .data(visibleLinks)
          .join(
            (enter: {
              append: (arg0: string) => {
                (): any;
                new (): any;
                attr: {
                  (arg0: string, arg1: string): {
                    (): any;
                    new (): any;
                    attr: { (arg0: string, arg1: number): any; new (): any };
                  };
                  new (): any;
                };
              };
            }) =>
              enter
                .append('line')
                .attr('stroke', '#999')
                .attr('stroke-width', 2),
            (update: any) => update,
            (exit: {
              transition: () => {
                (): any;
                new (): any;
                duration: {
                  (arg0: number): {
                    (): any;
                    new (): any;
                    style: {
                      (arg0: string, arg1: number): {
                        (): any;
                        new (): any;
                        remove: { (): any; new (): any };
                      };
                      new (): any;
                    };
                  };
                  new (): any;
                };
              };
            }) => exit.transition().duration(500).style('opacity', 0).remove()
          );

        this.simulation.alpha(1).restart();
      });

    // Kreise für die Knoten
    nodeGroup
      .selectAll('circle')
      .data((d) => [d])
      .join('circle')
      .attr('r', (d: any) => {
        switch (d.group) {
          case 1:
            return 50;
          case 2:
            return 30;
          case 3:
            return 20;
          default:
            return 10;
        }
      })
      .attr('fill', (d: any) => {
        switch (d.group) {
          case 1:
            return '#ff7f0e';
          case 2:
            return '#1f77b4';
          case 3:
            return '#2ca02c';
          default:
            return '#999';
        }
      });

    // Text-Labels
    nodeGroup
      .selectAll('text')
      .data((d) => [d])
      .join('text')
      .attr('text-anchor', (d: any) => (d.group === 1 ? 'middle' : 'start'))
      .attr('dx', (d: any) => (d.group === 1 ? 0 : 30))
      .attr('dy', '.35em')
      .attr('font-size', (d: any) => {
        switch (d.group) {
          case 1:
            return '16px';
          case 2:
            return '14px';
          case 3:
            return '12px';
          default:
            return '12px';
        }
      })
      .attr('font-weight', (d: any) => (d.group === 1 ? 'bold' : 'normal'))
      .attr('font-family', 'Arial, Helvetica, sans-serif')
      .text((d: any) => d.name || d.id)
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

  private toggleNode(node: any): void {
    node.collapsed = !node.collapsed;

    // Filter sichtbare Nodes und Links
    const visibleNodes = this.data.nodes.filter((n: any) => {
      if (n.parent) {
        const parentNode = this.data.nodes.find(
          (pn: any) => pn.id === n.parent
        );
        return !parentNode?.collapsed;
      }
      return true;
    });

    const visibleLinks = this.data.links.filter((link) => {
      return (
        visibleNodes.some((n) => (n as any).id === (link.target as any).id) &&
        visibleNodes.some((n) => (n as any).id === (link.source as any).id)
      );
    });

    // Update Visualisierung
    this.updateVisibility(visibleNodes, visibleLinks);
  }

  private updateVisibility(visibleNodes: Node[], visibleLinks: Link[]): void {
    // Nodes aktualisieren
    const nodeGroups = this.svg
      .select('g') // Wähle die bestehende Gruppe
      .selectAll('.node')
      .data(visibleNodes, (d: any) => d.id);

    // Enter
    const enterNodes = nodeGroups
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('opacity', 0);

    this.renderNodes(enterNodes);

    // Exit
    nodeGroups.exit().transition().duration(500).style('opacity', 0).remove();

    // Update
    nodeGroups.transition().duration(500).style('opacity', 1);

    // Links aktualisieren
    const links = this.svg
      .select('g') // Gleiche Gruppe wie für Nodes
      .selectAll('line')
      .data(visibleLinks);

    links.exit().transition().duration(500).style('opacity', 0).remove();

    links
      .enter()
      .append('line')
      .attr('stroke-width', 2)
      .attr('stroke', '#999')
      .style('opacity', 0)
      .transition()
      .duration(500)
      .style('opacity', 0.6);

    // Simulation neu starten
    this.simulation.nodes(visibleNodes);
    this.simulation.force('link').links(visibleLinks);
    this.simulation.alpha(1).restart();
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
