export interface PlanetPosition {
  name: string;
  longitude: number;
  rashiIndex: number;
  rashiName: string;
  degreeInRashi: number;
  nakshatraIndex: number;
  nakshatraName: string;
  pada: number;
  retrograde: boolean;
  houseNumber: number;
}

export interface DashaPeriod {
  lord: string;
  startDate: string;
  endDate: string;
  antardashas?: DashaPeriod[];
}

export interface NatalChart {
  name: string;
  birthDate: string;
  birthTime: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  julianDay: number;
  lagnaRashi: number;
  lagnaRashiName: string;
  lagnaLongitude: number;
  moonNakshatra: string;
  moonNakshatraIndex: number;
  moonNakshatraPada: number;
  planets: PlanetPosition[];
  mahadashas: DashaPeriod[];
  currentMahadasha: string;
  currentAntardasha: string;
  calculatedAt: string;
}

export interface BirthData {
  name: string;
  date: string;       // yyyy-MM-dd
  time: string;       // HH:mm
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface GeocodingResult {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
