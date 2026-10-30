export interface HistoricalAdPoint {
  investment: number;
  trials: number;
  label?: string;
}

export const HISTORICAL_ADS: HistoricalAdPoint[] = [
  { investment: 0, trials: 0, label: 'Base cero' },
  { investment: 5000, trials: 290, label: 'Enero ($5k)' },
  { investment: 10000, trials: 500, label: 'Julio a septiembre promedio ($10k)' },
  { investment: 15000, trials: 650, label: 'Abril prueba ($15k)' },
  { investment: 20000, trials: 760, label: 'Mayo prueba ($20k)' },
  { investment: 30000, trials: 900, label: 'Junio prueba 1 semana a mes ($30k)' },
];

export interface PlatformChannelData {
  platform: 'Meta' | 'Google';
  investment: number;
  impressions: number;
  clicks: number;
  ctr: number; // percentage e.g. 1.2
  trials: number;
  cpr: number; // cost per registration (trial)
}

export const SEPTEMBER_CHANNELS: PlatformChannelData[] = [
  {
    platform: 'Meta',
    investment: 6500,
    impressions: 812000,
    clicks: 9750,
    ctr: 1.2,
    trials: 433,
    cpr: 15.01,
  },
  {
    platform: 'Google',
    investment: 3500,
    impressions: 41000,
    clicks: 1480,
    ctr: 3.6,
    trials: 67,
    cpr: 52.24,
  },
];
