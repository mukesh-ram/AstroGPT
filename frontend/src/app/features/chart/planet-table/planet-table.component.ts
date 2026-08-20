import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanetPosition } from '../../../core/models/natal-chart.model';

@Component({
  selector: 'app-planet-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="planet-table-card glass-card">
      <h3>Planetary Positions</h3>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Planet</th>
              <th>Sign</th>
              <th>Degree</th>
              <th>Nakshatra</th>
              <th>House</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of planets">
              <td>
                <span class="planet-name">{{ p.name }}</span>
                <span class="retro-badge" *ngIf="p.retrograde">R</span>
              </td>
              <td>{{ p.rashiName }}</td>
              <td>{{ p.degreeInRashi | number:'1.2-2' }}°</td>
              <td>{{ p.nakshatraName }} ({{ p.pada }})</td>
              <td>{{ p.houseNumber }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .planet-table-card {
      padding: 20px;
      height: 100%;
      
      h3 {
        margin-bottom: 16px;
        color: var(--color-primary-light);
        font-family: 'Cinzel', serif;
      }
    }

    .table-container {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;

      th {
        text-align: left;
        padding: 12px;
        color: var(--color-text-muted);
        font-weight: 500;
        text-transform: uppercase;
        font-size: 12px;
        letter-spacing: 0.05em;
        border-bottom: 1px solid var(--border-glass);
      }

      td {
        padding: 12px;
        border-bottom: 1px solid rgba(255,255,255,0.02);
      }

      tbody tr {
        transition: var(--transition);
        &:hover {
          background: rgba(255,255,255,0.03);
        }
      }
    }

    .planet-name {
      font-weight: 600;
      color: var(--color-accent-light);
    }

    .retro-badge {
      display: inline-block;
      margin-left: 6px;
      font-size: 10px;
      background: var(--color-error);
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: bold;
    }
  `]
})
export class PlanetTableComponent {
  @Input() planets: PlanetPosition[] = [];
}
