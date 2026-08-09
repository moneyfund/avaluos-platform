import { SERVICIO_PESO } from './weights';

export type ServiciosBasicos = { agua?: boolean; energia?: boolean; drenaje?: boolean; senalTelefonica?: boolean; internet?: boolean };

export const SERVICIOS_BASICOS = [
  { key: 'agua', label: 'Agua potable', peso: 0.04 },
  { key: 'energia', label: 'Energía eléctrica / luz', peso: 0.04 },
  { key: 'drenaje', label: 'Sistema de drenaje', peso: 0.05 },
  { key: 'senalTelefonica', label: 'Acceso a señal telefónica', peso: 0.02 },
  { key: 'internet', label: 'Acceso a internet', peso: 0.03 },
] as const;

export const getServiciosBasicosFactor = (serviciosBasicos?: ServiciosBasicos) => {
  const servicios = serviciosBasicos || {};
  const total = SERVICIOS_BASICOS.reduce((factor, servicio) => factor + (servicios[servicio.key] ? servicio.peso : -servicio.peso), 1);
  return Math.max(0.82, total);
};

export const formatServiciosBasicos = (serviciosBasicos?: ServiciosBasicos) => SERVICIOS_BASICOS
  .map((servicio) => `${servicio.label}: ${serviciosBasicos?.[servicio.key] ? 'Sí' : 'No'}`)
  .join(', ');

export const sumServicios = (servicios: string[]) => 1 + servicios.reduce((a, s) => a + (SERVICIO_PESO[s as keyof typeof SERVICIO_PESO] ?? 0), 0);
export const range = (v: number) => ({ minimo: v * 0.93, maximo: v * 1.08 });
export const confidence = (coefCount: number) => coefCount >= 10 ? 'Alto' : coefCount >= 7 ? 'Medio' : 'Base';

export const toSafeNumber = (value: unknown, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

export const safeDivide = (numerator: unknown, denominator: unknown, fallback = 0) => {
  const n = toSafeNumber(numerator, 0);
  const d = toSafeNumber(denominator, 0);
  if (d === 0) return fallback;
  return n / d;
};

export const toSafeFactor = (value: unknown, fallback = 1) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};
