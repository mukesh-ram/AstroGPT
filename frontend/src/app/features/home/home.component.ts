import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ChartService } from '../../core/services/chart.service';
import { GeocodingResult } from '../../core/models/natal-chart.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="home-container animate-in">
      <div class="hero-section">
        <h1 class="headline">Discover Your Cosmic Blueprint</h1>
        <p class="subtitle">Powered by Vedic Astrology & AI</p>
      </div>

      <div class="form-container">
        <div class="glass-card form-card">
          <form [formGroup]="birthForm" (ngSubmit)="onSubmit()">
            
            <div class="form-group">
              <label for="name">Full Name</label>
              <input type="text" id="name" formControlName="name" placeholder="Enter your name">
            </div>

            <div class="form-row">
              <div class="form-group half-width">
                <label for="date">Date of Birth</label>
                <input type="date" id="date" formControlName="date">
              </div>
              <div class="form-group half-width">
                <label for="time">Time of Birth</label>
                <input type="time" id="time" formControlName="time">
              </div>
            </div>

            <div class="form-group location-group">
              <label for="city">City of Birth</label>
              <input 
                type="text" 
                id="city" 
                formControlName="citySearch" 
                placeholder="Search city..." 
                autocomplete="off"
                (focus)="showDropdown = true"
                (input)="onCityInput($event)"
              >
              
              <div class="dropdown-list glass-card" *ngIf="showDropdown && searchResults.length > 0">
                <div 
                  class="dropdown-item" 
                  *ngFor="let result of searchResults"
                  (click)="selectCity(result)"
                >
                  <span class="city-name">{{ result.name }}</span>
                  <span class="country-name">{{ result.country }}</span>
                </div>
              </div>
            </div>

            <div class="error-message" *ngIf="errorMsg">{{ errorMsg }}</div>

            <button type="submit" class="btn-primary submit-btn" [disabled]="isCalculating()">
              <span *ngIf="!isCalculating()">Calculate My Kundali</span>
              <div *ngIf="isCalculating()" class="loading-spinner"></div>
            </button>
            
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 60px 20px;
    }

    .hero-section {
      text-align: center;
      margin-bottom: 40px;

      .headline {
        font-family: 'Cinzel', serif;
        font-size: 48px;
        font-weight: 700;
        margin-bottom: 16px;
        background: linear-gradient(to right, #fff, var(--color-primary-light));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .subtitle {
        font-size: 18px;
        color: var(--color-text-muted);
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }
    }

    .form-container {
      width: 100%;
      max-width: 500px;
    }

    .form-card {
      padding: 40px;

      form {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
    }

    .form-row {
      display: flex;
      gap: 16px;
      
      .half-width {
        flex: 1;
      }
    }

    .location-group {
      position: relative;
    }

    .dropdown-list {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      margin-top: 8px;
      max-height: 200px;
      overflow-y: auto;
      z-index: 10;
      padding: 8px 0;

      .dropdown-item {
        padding: 12px 16px;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: var(--transition);

        &:hover {
          background: rgba(123,94,167,0.2);
        }

        .city-name {
          font-weight: 500;
        }

        .country-name {
          font-size: 12px;
          color: var(--color-text-muted);
        }
      }
    }

    .submit-btn {
      width: 100%;
      margin-top: 16px;
      height: 48px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .error-message {
      color: var(--color-error);
      font-size: 14px;
      text-align: center;
      background: rgba(239,83,80,0.1);
      padding: 10px;
      border-radius: 8px;
    }

    @media (max-width: 600px) {
      .headline { font-size: 32px !important; }
      .form-card { padding: 24px; }
      .form-row { flex-direction: column; }
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  birthForm: FormGroup;
  searchResults: GeocodingResult[] = [];
  showDropdown = false;
  errorMsg = '';
  
  private searchSubject = new Subject<string>();
  private sub = new Subscription();

  private chartService = inject(ChartService);
  private router = inject(Router);
  
  isCalculating = this.chartService.isCalculating;

  constructor(private fb: FormBuilder) {
    this.birthForm = this.fb.group({
      name: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      citySearch: ['', Validators.required],
      city: [''],
      latitude: [null, Validators.required],
      longitude: [null, Validators.required],
      timezone: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.sub.add(
      this.searchSubject.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap(query => this.chartService.searchCity(query).pipe(
          catchError(err => {
            console.error('Geocoding error', err);
            this.errorMsg = 'Error loading city suggestions. Please try again.';
            return of([]);
          })
        ))
      ).subscribe({
        next: (results) => {
          this.searchResults = results;
          if (results.length > 0) {
            this.showDropdown = true;
            this.errorMsg = '';
          } else if (!this.errorMsg) {
             this.showDropdown = false;
          }
        }
      })
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  onCityInput(event: any) {
    const value = event.target.value;
    if (value && value.length > 2) {
      this.searchSubject.next(value);
    } else {
      this.searchResults = [];
      this.showDropdown = false;
    }
  }

  selectCity(result: GeocodingResult) {
    this.birthForm.patchValue({
      citySearch: `${result.name}, ${result.country}`,
      city: result.name,
      latitude: result.latitude,
      longitude: result.longitude,
      timezone: result.timezone
    });
    this.showDropdown = false;
  }

  onSubmit() {
    if (this.birthForm.invalid) {
      this.birthForm.markAllAsTouched();
      if (this.birthForm.get('citySearch')?.value && !this.birthForm.get('latitude')?.value) {
        this.errorMsg = 'Please select your specific city from the dropdown suggestions.';
      } else {
        this.errorMsg = 'Please fill in all required fields.';
      }
      return;
    }

    this.errorMsg = '';
    this.chartService.isCalculating.set(true);

    const formData = this.birthForm.value;
    
    this.chartService.calculateChart({
      name: formData.name,
      date: formData.date,
      time: formData.time,
      city: formData.city,
      latitude: formData.latitude,
      longitude: formData.longitude,
      timezone: formData.timezone
    }).subscribe({
      next: (chart) => {
        this.chartService.setChart(chart);
        this.chartService.isCalculating.set(false);
        this.router.navigate(['/chart']);
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'Failed to calculate chart. Please try again.';
        this.chartService.isCalculating.set(false);
      }
    });
  }
}
