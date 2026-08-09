import { ESTELI_ZONES } from './esteliZones';
import { MATAGALPA_ZONES } from './matagalpaZones';
import type { CiudadObjetivo } from '../types/avaluo.types';

export const CIUDADES_AVALUO: CiudadObjetivo[] = ['Matagalpa', 'Estelí'];
export const CIUDAD_UNICA = 'Matagalpa' as const;
export const ZONAS_MATAGALPA = MATAGALPA_ZONES;
export const ZONAS_ESTELI = ESTELI_ZONES;

export const ZONAS_POR_CIUDAD = {
  Matagalpa: MATAGALPA_ZONES,
  Estelí: ESTELI_ZONES,
} as const;

export const getZonasByCiudad = (ciudad?: string) => ZONAS_POR_CIUDAD[ciudad as CiudadObjetivo] || [];
export const getZonaByCiudadAndNombre = (ciudad?: string, zona?: string) => getZonasByCiudad(ciudad).find((z) => z.nombre === zona || z.zona === zona) || null;
