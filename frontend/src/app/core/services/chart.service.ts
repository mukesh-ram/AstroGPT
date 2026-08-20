import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { NatalChart, BirthData, GeocodingResult } from '../models/natal-chart.model';

@Injectable({ providedIn: 'root' })
export class ChartService {
  private readonly apiBase = 'https://astrogpt-backend.onrender.com/api';
  private _chart = new BehaviorSubject<NatalChart | null>(null);
  chart$ = this._chart.asObservable();
  isCalculating = signal(false);

  constructor(private http: HttpClient) {}

  calculateChart(data: BirthData): Observable<NatalChart> {
    return this.http.post<NatalChart>(`${this.apiBase}/chart/calculate`, data);
  }

  setChart(chart: NatalChart): void {
    this._chart.next(chart);
  }

  getChart(): NatalChart | null {
    return this._chart.value;
  }

  searchCity(city: string): Observable<GeocodingResult[]> {
    return this.http.get<GeocodingResult[]>(`${this.apiBase}/geocoding/search`, { params: { city } });
  }
}
