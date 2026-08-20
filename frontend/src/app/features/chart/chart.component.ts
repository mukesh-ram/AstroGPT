import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ChartService } from '../../core/services/chart.service';
import { KundaliViewerComponent } from './kundali-viewer/kundali-viewer.component';
import { PlanetTableComponent } from './planet-table/planet-table.component';
import { DashaTimelineComponent } from './dasha-timeline/dasha-timeline.component';
import { ChatInterfaceComponent } from '../chat/chat-interface/chat-interface.component';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [
    CommonModule, 
    KundaliViewerComponent, 
    PlanetTableComponent, 
    DashaTimelineComponent, 
    ChatInterfaceComponent
  ],
  template: `
    <div class="chart-dashboard animate-in" *ngIf="chartData">
      <div class="left-panel">
        <app-kundali-viewer [chart]="chartData"></app-kundali-viewer>
        
        <div class="info-grid">
          <app-planet-table [planets]="chartData.planets"></app-planet-table>
          <app-dasha-timeline 
            [mahadashas]="chartData.mahadashas"
            [currentMahadasha]="chartData.currentMahadasha"
            [currentAntardasha]="chartData.currentAntardasha"
          ></app-dasha-timeline>
        </div>
      </div>
      
      <div class="right-panel">
        <app-chat-interface [chart]="chartData"></app-chat-interface>
      </div>
    </div>
  `,
  styles: [`
    .chart-dashboard {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 24px;
      padding: 24px;
      height: calc(100vh - 72px);
      overflow: hidden;
    }

    .left-panel {
      display: flex;
      flex-direction: column;
      gap: 24px;
      overflow-y: auto;
      padding-right: 12px;
      height: 100%;
      min-height: 0;
    }

    .right-panel {
      height: 100%;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    @media (max-width: 1200px) {
      .info-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 900px) {
      .chart-dashboard {
        grid-template-columns: 1fr;
        overflow: auto;
        height: auto;
      }
      .left-panel {
        overflow-y: visible;
        padding-right: 0;
      }
    }
  `]
})
export class ChartComponent implements OnInit {
  chartData: any;

  constructor(
    private chartService: ChartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.chartData = this.chartService.getChart();
    if (!this.chartData) {
      this.router.navigate(['/']);
    }
  }
}
