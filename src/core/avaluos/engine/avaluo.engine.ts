import type { CasaInput, PropertyType, TerrenoInput, ZonaData } from '../types/avaluo.types';
import { calcularTerreno } from './terreno.engine';
import { calcularCasa } from './casa.engine';

export const calcularAvaluo = (tipo: PropertyType, data: Record<string, unknown>, zona: ZonaData) => {
  if (tipo === 'terreno') return calcularTerreno(data as TerrenoInput, zona);
  return calcularCasa(data as CasaInput, zona);
};
