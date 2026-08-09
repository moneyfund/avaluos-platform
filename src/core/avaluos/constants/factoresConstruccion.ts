export const FACTORES_CONSTRUCCION = {
  cimentacion: { 'Concreto reforzado': 1.08, Mixta: 1, Mampostería: 0.95, Pilotes: 1.1 },
  paredes: { Concreto: 1.08, Bloque: 1, Ladrillo: 1.02, Gypsum: 0.92, Madera: 0.88 },
  techo: { Losa: 1.1, Teja: 1.05, Zinc: 0.95, 'Lámina troquelada': 1, Fibrocemento: 0.9 },
  cieloRaso: { Gypsum: 1.06, PVC: 1.01, Madera: 1.04, 'Sin cielo raso': 0.9 },
  piso: { Porcelanato: 1.1, Cerámica: 1.02, Granito: 1.08, Concreto: 0.92, Tierra: 0.75 },
  ventanas: { Aluminio: 1.03, PVC: 1.04, Madera: 1, Hierro: 0.95 },
  puertas: { Madera: 1.03, Metálicas: 1, MDF: 0.96, 'Puertas premium': 1.08 },
  sistemas: { Excelente: 1.06, Bueno: 1, Regular: 0.93, Deficiente: 0.82 },
} as const;
