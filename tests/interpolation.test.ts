import { describe, it, expect } from 'vitest';
import { interpolateTrials } from '../src/engine/interpolation';

describe('Interpolación lineal de trials e inversión publicitaria', () => {
  it('Verifica los puntos históricos exactos del caso Agendo', () => {
    expect(interpolateTrials(0)).toBe(0);
    expect(interpolateTrials(5000)).toBe(290);
    expect(interpolateTrials(10000)).toBe(500);
    expect(interpolateTrials(15000)).toBe(650);
    expect(interpolateTrials(20000)).toBe(760);
    expect(interpolateTrials(30000)).toBe(900);
  });

  it('Verifica interpolación lineal en puntos intermedios', () => {
    // Entre $0 y $5.000: $2.500 debe dar 145
    expect(interpolateTrials(2500)).toBeCloseTo(145, 1);

    // Entre $5.000 y $10.000: $7.500 debe dar (290 + 500)/2 = 395
    expect(interpolateTrials(7500)).toBeCloseTo(395, 1);

    // Entre $10.000 y $15.000: $12.500 debe dar (500 + 650)/2 = 575
    expect(interpolateTrials(12500)).toBeCloseTo(575, 1);

    // Entre $20.000 y $30.000: $25.000 debe dar (760 + 900)/2 = 830
    expect(interpolateTrials(25000)).toBeCloseTo(830, 1);
  });

  it('No extrapola fuera del rango [0, 30.000]', () => {
    expect(interpolateTrials(-100)).toBe(0);
    expect(interpolateTrials(35000)).toBe(900);
  });
});
