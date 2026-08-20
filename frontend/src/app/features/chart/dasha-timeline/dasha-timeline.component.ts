import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DashaPeriod } from '../../../core/models/natal-chart.model';

@Component({
  selector: 'app-dasha-timeline',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe],
  template: `
    <div class="dasha-card glass-card">
      <h3>Vimshottari Dasha</h3>
      
      <div class="current-dasha glass-card">
        <div class="dasha-label">Current Phase</div>
        <div class="dasha-value text-accent">{{ currentMahadasha }} - {{ currentAntardasha }}</div>
      </div>

      <div class="timeline">
        <div class="timeline-item" 
             *ngFor="let d of mahadashas"
             [class.active]="d.lord === currentMahadasha">
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            <div class="dasha-lord">{{ d.lord }} Mahadasha</div>
            <div class="dasha-dates">
              {{ d.startDate | date:'MMM yyyy' }} - {{ d.endDate | date:'MMM yyyy' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dasha-card {
      padding: 20px;
      height: 100%;
      
      h3 {
        margin-bottom: 16px;
        color: var(--color-primary-light);
        font-family: 'Cinzel', serif;
      }
    }

    .current-dasha {
      padding: 16px;
      text-align: center;
      margin-bottom: 24px;
      background: rgba(123,94,167,0.1);
      border-color: var(--color-primary);

      .dasha-label {
        font-size: 12px;
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin-bottom: 4px;
      }

      .dasha-value {
        font-size: 18px;
        font-weight: 600;
        color: var(--color-accent);
      }
    }

    .timeline {
      position: relative;
      padding-left: 20px;
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 2px;
        background: var(--border-glass);
      }
    }

    .timeline-item {
      position: relative;
      padding-bottom: 16px;

      &:last-child { padding-bottom: 0; }

      .timeline-marker {
        position: absolute;
        left: -24px;
        top: 4px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: var(--bg-secondary);
        border: 2px solid var(--color-primary-light);
        transition: var(--transition);
      }

      .timeline-content {
        .dasha-lord {
          font-weight: 500;
          color: var(--color-text);
        }
        .dasha-dates {
          font-size: 12px;
          color: var(--color-text-muted);
          margin-top: 4px;
        }
      }

      &.active {
        .timeline-marker {
          background: var(--color-accent);
          border-color: var(--color-accent);
          box-shadow: 0 0 10px var(--color-accent);
        }
        .dasha-lord {
          color: var(--color-accent);
          font-weight: 600;
        }
      }
    }
  `]
})
export class DashaTimelineComponent {
  @Input() mahadashas: DashaPeriod[] = [];
  @Input() currentMahadasha = '';
  @Input() currentAntardasha = '';
}
