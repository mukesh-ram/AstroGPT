import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NatalChart } from '../../../core/models/natal-chart.model';

interface HouseData {
  number: number;
  rashiName: string;
  planets: string[];
}

@Component({
  selector: 'app-kundali-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="kundali-card glass-card">
      <div class="chart-header">
        <h2>{{ chart?.name }}'s Kundali</h2>
        <span class="lagna-badge">Lagna: {{ chart?.lagnaRashiName }}</span>
      </div>

      <div class="svg-container">
        <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          
          <!-- Outer frame -->
          <rect x="10" y="10" width="380" height="380" fill="none" stroke="var(--color-primary-light)" stroke-width="2" class="chart-line"/>
          
          <!-- Diagonals -->
          <line x1="10" y1="10" x2="390" y2="390" stroke="var(--color-primary-light)" stroke-width="1" class="chart-line"/>
          <line x1="10" y1="390" x2="390" y2="10" stroke="var(--color-primary-light)" stroke-width="1" class="chart-line"/>
          
          <!-- Inner diamond -->
          <line x1="200" y1="10" x2="390" y2="200" stroke="var(--color-primary-light)" stroke-width="2" class="chart-line"/>
          <line x1="390" y1="200" x2="200" y2="390" stroke="var(--color-primary-light)" stroke-width="2" class="chart-line"/>
          <line x1="200" y1="390" x2="10" y2="200" stroke="var(--color-primary-light)" stroke-width="2" class="chart-line"/>
          <line x1="10" y1="200" x2="200" y2="10" stroke="var(--color-primary-light)" stroke-width="2" class="chart-line"/>

          <!-- House 1 (Top Middle Diamond) -->
          <g class="house-group animate-h1">
            <text x="200" y="70" class="house-text" text-anchor="middle">{{ getHouseData(1)?.rashiName }}</text>
            <text x="200" y="100" class="planet-text" text-anchor="middle">{{ getPlanetsStr(1) }}</text>
            <text x="200" y="30" class="house-num" text-anchor="middle">1</text>
          </g>

          <!-- House 2 (Top Left Triangle) -->
          <g class="house-group animate-h2">
            <text x="100" y="50" class="house-text" text-anchor="middle">{{ getHouseData(2)?.rashiName }}</text>
            <text x="100" y="80" class="planet-text" text-anchor="middle">{{ getPlanetsStr(2) }}</text>
            <text x="50" y="30" class="house-num" text-anchor="middle">2</text>
          </g>

          <!-- House 3 (Left Top Triangle) -->
          <g class="house-group animate-h3">
            <text x="50" y="130" class="house-text" text-anchor="middle">{{ getHouseData(3)?.rashiName }}</text>
            <text x="50" y="160" class="planet-text" text-anchor="middle">{{ getPlanetsStr(3) }}</text>
            <text x="30" y="110" class="house-num" text-anchor="middle">3</text>
          </g>

          <!-- House 4 (Middle Left Diamond) -->
          <g class="house-group animate-h4">
            <text x="100" y="200" class="house-text" text-anchor="middle">{{ getHouseData(4)?.rashiName }}</text>
            <text x="100" y="230" class="planet-text" text-anchor="middle">{{ getPlanetsStr(4) }}</text>
            <text x="40" y="200" class="house-num" text-anchor="middle">4</text>
          </g>

          <!-- House 5 (Left Bottom Triangle) -->
          <g class="house-group animate-h5">
            <text x="50" y="280" class="house-text" text-anchor="middle">{{ getHouseData(5)?.rashiName }}</text>
            <text x="50" y="310" class="planet-text" text-anchor="middle">{{ getPlanetsStr(5) }}</text>
            <text x="30" y="370" class="house-num" text-anchor="middle">5</text>
          </g>

          <!-- House 6 (Bottom Left Triangle) -->
          <g class="house-group animate-h6">
            <text x="120" y="340" class="house-text" text-anchor="middle">{{ getHouseData(6)?.rashiName }}</text>
            <text x="120" y="370" class="planet-text" text-anchor="middle">{{ getPlanetsStr(6) }}</text>
            <text x="100" y="380" class="house-num" text-anchor="middle">6</text>
          </g>

          <!-- House 7 (Bottom Middle Diamond) -->
          <g class="house-group animate-h7">
            <text x="200" y="320" class="house-text" text-anchor="middle">{{ getHouseData(7)?.rashiName }}</text>
            <text x="200" y="350" class="planet-text" text-anchor="middle">{{ getPlanetsStr(7) }}</text>
            <text x="200" y="380" class="house-num" text-anchor="middle">7</text>
          </g>

          <!-- House 8 (Bottom Right Triangle) -->
          <g class="house-group animate-h8">
            <text x="280" y="340" class="house-text" text-anchor="middle">{{ getHouseData(8)?.rashiName }}</text>
            <text x="280" y="370" class="planet-text" text-anchor="middle">{{ getPlanetsStr(8) }}</text>
            <text x="350" y="380" class="house-num" text-anchor="middle">8</text>
          </g>

          <!-- House 9 (Right Bottom Triangle) -->
          <g class="house-group animate-h9">
            <text x="350" y="280" class="house-text" text-anchor="middle">{{ getHouseData(9)?.rashiName }}</text>
            <text x="350" y="310" class="planet-text" text-anchor="middle">{{ getPlanetsStr(9) }}</text>
            <text x="370" y="370" class="house-num" text-anchor="middle">9</text>
          </g>

          <!-- House 10 (Middle Right Diamond) -->
          <g class="house-group animate-h10">
            <text x="300" y="200" class="house-text" text-anchor="middle">{{ getHouseData(10)?.rashiName }}</text>
            <text x="300" y="230" class="planet-text" text-anchor="middle">{{ getPlanetsStr(10) }}</text>
            <text x="370" y="200" class="house-num" text-anchor="middle">10</text>
          </g>

          <!-- House 11 (Right Top Triangle) -->
          <g class="house-group animate-h11">
            <text x="350" y="130" class="house-text" text-anchor="middle">{{ getHouseData(11)?.rashiName }}</text>
            <text x="350" y="160" class="planet-text" text-anchor="middle">{{ getPlanetsStr(11) }}</text>
            <text x="370" y="110" class="house-num" text-anchor="middle">11</text>
          </g>

          <!-- House 12 (Top Right Triangle) -->
          <g class="house-group animate-h12">
            <text x="280" y="50" class="house-text" text-anchor="middle">{{ getHouseData(12)?.rashiName }}</text>
            <text x="280" y="80" class="planet-text" text-anchor="middle">{{ getPlanetsStr(12) }}</text>
            <text x="350" y="30" class="house-num" text-anchor="middle">12</text>
          </g>

          <text x="200" y="180" class="center-name" text-anchor="middle" fill="var(--color-accent)">{{ chart?.name }}</text>
        </svg>
      </div>
    </div>
  `,
  styles: [`
    .kundali-card {
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .chart-header {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      h2 {
        font-family: 'Cinzel', serif;
        font-size: 24px;
        color: var(--color-primary-light);
      }

      .lagna-badge {
        background: rgba(123,94,167,0.2);
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 14px;
        color: var(--color-accent);
        border: 1px solid var(--color-primary);
      }
    }

    .svg-container {
      width: 100%;
      max-width: 400px;
      aspect-ratio: 1;
      
      svg {
        width: 100%;
        height: 100%;
        filter: drop-shadow(0 0 10px rgba(123,94,167,0.2));
      }
    }

    .chart-line {
      transition: var(--transition);
    }

    .house-group {
      opacity: 0;
      animation: fadeIn 0.5s ease forwards;
      
      &:hover {
        .house-text { fill: var(--color-accent); }
        .planet-text { fill: #fff; filter: url(#glow); }
      }
    }

    .house-text {
      fill: var(--color-text-muted);
      font-size: 12px;
      font-family: 'Inter', sans-serif;
      transition: var(--transition);
    }

    .planet-text {
      fill: var(--color-text);
      font-size: 14px;
      font-weight: 600;
      font-family: 'Inter', sans-serif;
      transition: var(--transition);
    }

    .house-num {
      fill: rgba(255,255,255,0.2);
      font-size: 10px;
    }

    .center-name {
      font-family: 'Cinzel', serif;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 1px;
    }

    @keyframes fadeIn {
      to { opacity: 1; }
    }

    @for $i from 1 through 12 {
      .animate-h#{$i} {
        animation-delay: #{$i * 0.1}s;
      }
    }
  `]
})
export class KundaliViewerComponent implements OnInit {
  @Input() chart?: NatalChart;
  houses: Map<number, HouseData> = new Map();

  ngOnInit() {
    if (this.chart) {
      this.processChartData();
    }
  }

  private processChartData() {
    for (let i = 1; i <= 12; i++) {
      let rashiIndex = (this.chart!.lagnaRashi + i - 1) % 12;
      if (rashiIndex === 0) rashiIndex = 12;
      
      const planetsInHouse = this.chart!.planets.filter(p => p.houseNumber === i)
        .map(p => {
          let name = p.name.substring(0, 2);
          if (p.retrograde) name += '(R)';
          return name;
        });

      this.houses.set(i, {
        number: i,
        rashiName: this.getRashiName(rashiIndex),
        planets: planetsInHouse
      });
    }
  }

  getHouseData(houseNum: number): HouseData | undefined {
    return this.houses.get(houseNum);
  }

  getPlanetsStr(houseNum: number): string {
    const data = this.houses.get(houseNum);
    return data ? data.planets.join(' ') : '';
  }

  private getRashiName(index: number): string {
    const rashis = ['', 'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    return rashis[index] || '';
  }
}
